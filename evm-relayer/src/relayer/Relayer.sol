// SPDX-License-Identifier: Apache 2
pragma solidity ^0.8.20;

import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {ITokenBridge} from "@modules/wormhole/ITokenBridge.sol";

import {RelayerGovernance, IWormhole, IERC20, SafeERC20} from "./RelayerGovernance.sol";
import {RelayerMessages, BytesLib} from "./RelayerMessages.sol";

/**
 * @title A Cross-Chain Relayer Application
 * @notice This contract uses Wormhole's token bridge contract to send tokens
 * cross chain with an aribtrary message payload.
 */
contract Relayer is
    UUPSUpgradeable,
    RelayerGovernance,
    RelayerMessages,
    ReentrancyGuardUpgradeable
{
    using BytesLib for bytes;
    using MessageHashUtils for bytes32;
    using ECDSA for bytes32;

    /**
     * @notice Deploys the smart contract and sanity checks initial deployment values
     * @dev Sets the admin, wormhole, tokenBridge, chainId, wormholeFinality,
     * feePrecision and relayerFeePercentage state variables. See RelayerState.sol
     * for descriptions of each state variable.
     */
    function initialize(
        address defaultOwner_,
        address signatureVerifier_,
        address wormhole_,
        address tokenBridge_,
        uint16 chainId_,
        uint8 wormholeFinality_,
        uint32 feePrecision_,
        uint32 relayerFeePercentage_
    ) public initializer {
        // sanity check input values
        require(
            signatureVerifier_ != address(0),
            "invalid signature verifier address"
        );
        require(defaultOwner_ != address(0), "invalid Admin address");
        require(wormhole_ != address(0), "invalid Wormhole address");
        require(tokenBridge_ != address(0), "invalid TokenBridge address");
        require(chainId_ > 0, "invalid chainId");
        require(wormholeFinality_ > 0, "invalid wormholeFinality");
        require(feePrecision_ > 0, "invalid fee precision");

        // set constructor state variables
        setWormhole(wormhole_);
        setTokenBridge(tokenBridge_);
        setChainId(chainId_);
        setWormholeFinality(wormholeFinality_);
        setFeePrecision(feePrecision_);
        setRelayerFeePercentage(relayerFeePercentage_);
        setOwner(defaultOwner_);
        _setSignatureVerifier(signatureVerifier_);
        __ReentrancyGuard_init();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal virtual override onlyOwner {} // solhint-disable-line

    function setSignatureVerifier(address target_) external onlyOwner {
        if (_state.signatureVerifier == target_ || target_ == address(0)) {
            revert Forbidden("Invalid value");
        }
        _setSignatureVerifier(target_);
    }

    function transferOwnerShip(address target_) external onlyOwner {
        if (_state.signatureVerifier != owner() || target_ == address(0)) {
            revert Forbidden("Invalid value");
        }
        setOwner(target_);
    }

    /**
     * ============================================================
     * ============================================================
     * ============================================================
     * ============================================================
     * ============================================================
     */

    /// seller function
    function createAnOrder(
        bytes32 orderId_,
        uint256 amount_
    ) external payable nonExistingOrder(orderId_) {
        if (amount_ == 0) {
            revert Forbidden("amount is zero");
        }

        Order memory _newOrder = Order({
            fee: calculateFeeRate(amount_, MakerOrTaker.Maker), // percentage
            orderOwner: MakerOrTaker.Maker,
            chainId: chainId(),
            claimDeadline: uint80(block.timestamp), // TODO: update this
            amount: amount_
        });

        setOrder(msg.sender, orderId_, _newOrder);
        emit OrderCreated(orderId_, _newOrder);
    }

    /// buyer function
    function placeAnOrder(
        uint16 chainId_,
        bytes32 orderId_,
        uint256 amount_,
        address token_,
        bytes calldata signature_
    ) external payable nonExistingOrder(orderId_) {
        if (
            !_isValidSignature(
                orderId_,
                amount_,
                token_,
                msg.sender,
                signature_
            )
        ) {
            revert Forbidden("invalid signature");
        }
        if (amount_ == 0) {
            revert Forbidden("amount is zero");
        }
        // TODO: if user deposit native token, convert to wrapped native token, then deposit

        Order memory _newOrder = Order({
            fee: calculateFeeRate(amount_, MakerOrTaker.Taker), // percentage
            orderOwner: MakerOrTaker.Taker,
            chainId: chainId_,
            claimDeadline: uint80(block.timestamp), // TODO: update this
            amount: amount_
        });

        SafeERC20.safeTransferFrom(
            IERC20(token_),
            msg.sender,
            address(this),
            calculateProduct(
                _newOrder.amount,
                _newOrder.fee,
                _newOrder.orderOwner
            )
        );

        setOrder(msg.sender, orderId_, _newOrder);
        emit OrderPlaced(orderId_, _newOrder);
    }

    /// buyer function
    function cancelTheOrder(
        bytes32 orderId_,
        address token_,
        bytes calldata signature_
    ) external payable {
        if (!_isValidSignature(orderId_, 0, token_, msg.sender, signature_)) {
            revert Forbidden("invalid signature");
        }
        Order storage _order = _state.orders[msg.sender][orderId_];
        if (_order.claimDeadline > uint80(block.timestamp)) {
            revert OrderLocked();
        }
        if (_order.amount == 0) {
            revert Forbidden("invalid order");
        }
        uint256 productAmount = calculateProduct(
            _order.amount,
            _order.fee,
            _order.orderOwner
        );
        _order.amount = 0;
        SafeERC20.safeTransfer(IERC20(token_), msg.sender, productAmount);

        emit OrderCanceled(orderId_, _order);
    }

    /// buyer function
    function confirmTheOrder(bytes32 orderId_) external {
        Order storage _order = _state.orders[msg.sender][orderId_];
        if (_order.amount == 0 || _order.chainId != chainId()) {
            revert Forbidden("invalid order");
        }
        _order.amount = 0;
        emit OrderConfirmed(orderId_, _order);
    }

    /// seller function
    function claimTheOrder(
        bytes32 orderId_,
        address token_,
        bytes calldata signature_
    ) external payable {
        if (!_isValidSignature(orderId_, 0, token_, msg.sender, signature_)) {
            revert Forbidden("invalid signature");
        }

        Order storage _order = _state.orders[msg.sender][orderId_];
        if (_order.amount == 0) {
            revert Forbidden("invalid order");
        }
        uint256 totalBalance = calculateProduct(
            _order.amount,
            calculateFeeRate(_order.amount, MakerOrTaker.Taker),
            MakerOrTaker.Taker
        );
        uint256 productAmount = calculateProduct(
            _order.amount,
            _order.fee,
            _order.orderOwner
        );
        _order.amount = 0;
        // transfer token
        SafeERC20.safeTransfer(IERC20(token_), msg.sender, productAmount);
        // take the fee
        SafeERC20.safeTransfer(
            IERC20(token_),
            owner(),
            totalBalance - productAmount
        );

        emit OrderCanceled(orderId_, _order);
    }

    /**
     *
     * buyer function
     * send token to target chain
     * @notice Transfers specified tokens to any registered Relayer contract
     * by invoking the `transferTokensWithPayload` method on the Wormhole token
     * bridge contract. `transferTokensWithPayload` allows the caller to send
     * an arbitrary message payload along with a token transfer. In this case,
     * the arbitrary message includes the transfer recipient's target-chain
     * wallet address.
     */
    function sendTokensWithPayload(
        uint32 batchId_,
        bytes32 orderId_,
        address token_,
        bytes32 targetRecipient_
    ) public payable nonReentrant returns (uint64 messageSequence) {
        if (targetRecipient_ == bytes32(0)) {
            revert Forbidden("targetRecipient cannot be bytes32(0)");
        }

        Order storage _orderData = _state.orders[msg.sender][orderId_];
        if (_orderData.amount == 0) {
            revert Forbidden("Invalid order");
        }

        /**
         * Compute the normalized amount to verify that it's nonzero.
         * The token bridge peforms the same operation before encoding
         * the amount in the `TransferWithPayload` message.
         */
        if (normalizeAmount(_orderData.amount, getDecimals(token_)) == 0) {
            revert Forbidden("normalized amount must be > 0");
        }

        // Cache the target contract address and verify that there
        // is a registered emitter for the specified targetChain.
        bytes32 targetContract = getRegisteredEmitter(_orderData.chainId);
        if (targetContract == bytes32(0)) {
            revert Forbidden("emitter not registered");
        }

        // Cache Wormhole fee value, and confirm that the caller has sent
        // enough value to pay for the Wormhole message fee.
        uint256 wormholeFee = wormhole().messageFee();
        if (msg.value < wormholeFee) {
            revert InsufficientBalance({
                actualAmount: msg.value,
                requiredAmount: wormholeFee
            });
        }

        uint256 amountReceived = calculateProduct(
            _orderData.amount,
            _orderData.fee,
            _orderData.orderOwner
        );
        _orderData.amount = 0;

        /**
         * Encode instructions (RelayerMessage) to send with the token transfer.
         * The `targetRecipient` address is in bytes32 format (zero-left-padded) to
         * support non-evm smart contracts that have addresses that are longer
         * than 20 bytes.
         */
        bytes memory messagePayload = encodePayload(
            RelayerMessage({payloadID: 1, targetRecipient: targetRecipient_})
        );

        // cache TokenBridge instance
        ITokenBridge bridge = tokenBridge();

        // approve the token bridge to spend the specified tokens
        SafeERC20.forceApprove(IERC20(token_), address(bridge), amountReceived);

        /**
         * Call `transferTokensWithPayload`method on the token bridge and pay
         * the Wormhole network fee. The token bridge will emit a Wormhole
         * message with an encoded `TransferWithPayload` struct (see the
         * ITokenBridge.sol interface file in this repo).
         */
        messageSequence = bridge.transferTokensWithPayload{value: wormholeFee}(
            token_,
            amountReceived,
            _orderData.chainId,
            targetContract,
            batchId_,
            messagePayload
        );

        emit OrderSent(orderId_, _orderData);
    }

    /**
     * @notice Consumes `TransferWithPayload` message which includes the additional
     * `RelayerMessage` payload with additional transfer instructions.
     */
    function redeemTransferWithPayload(
        bytes memory encodedTransferMessage
    ) public {
        IWormhole.VM memory parsedMessage = wormhole().parseVM(
            encodedTransferMessage
        );

        // cache the token bridge instance
        ITokenBridge bridge = tokenBridge();

        /**
         * Call `completeTransferWithPayload` on the token bridge. This
         * method acts as a reentrancy protection since it does not allow
         * transfers to be redeemed more than once.
         */
        bytes memory transferPayload = bridge.completeTransferWithPayload(
            encodedTransferMessage
        );

        // parse the wormhole message payload into the `TransferWithPayload` struct
        ITokenBridge.TransferWithPayload memory transfer = bridge
            .parseTransferWithPayload(transferPayload);

        // confirm that the message sender is a registered Relayer contract
        if (
            transfer.fromAddress !=
            getRegisteredEmitter(parsedMessage.emitterChainId)
        ) {
            revert Forbidden("emitter not registered");
        }

        // parse the RelayerMessage payload from the `TransferWithPayload` struct
        RelayerMessage memory relayerMessage = decodePayload(transfer.payload);

        // cache the recipient address
        address recipient = bytes32ToAddress(relayerMessage.targetRecipient);
        if (recipient != address(this)) {
            revert Forbidden("invalid recipient");
        }
    }

    /**
     * ============================================================
     * ============================================================
     * ============================================================
     * ============================================================
     * ============================================================
     */

    /**
     * @notice Calculates the amount of tokens to send the redeemer (relayer)
     * in terms of the transferred token based on the set `relayerFeePercentage`
     * on this chain.
     * @param amount The number of tokens being transferred
     * @return Fee Uint256 amount of tokens to send the relayer
     */
    function calculateRelayerFee(uint256 amount) public view returns (uint256) {
        return (amount * relayerFeePercentage()) / feePrecision();
    }

    function bytes32ToAddress(
        bytes32 address_
    ) internal pure returns (address) {
        require(bytes12(address_) == 0, "invalid EVM address");
        return address(uint160(uint256(address_)));
    }

    function getDecimals(address token) internal view returns (uint8) {
        (, bytes memory queriedDecimals) = token.staticcall(
            abi.encodeWithSignature("decimals()")
        );
        return abi.decode(queriedDecimals, (uint8));
    }

    function normalizeAmount(
        uint256 amount,
        uint8 decimals
    ) internal pure returns (uint256) {
        if (decimals > 8) {
            amount /= 10 ** (decimals - 8);
        }
        return amount;
    }

    function calculateProduct(
        uint256 product,
        uint8 fee,
        MakerOrTaker direction
    ) public pure returns (uint256 productAmount) {
        uint256 feeAmount = calculateFee(product, fee);
        bool isProductSafe = false;
        if (direction == MakerOrTaker.Maker) {
            (isProductSafe, productAmount) = Math.trySub(product, feeAmount);
        } else {
            (isProductSafe, productAmount) = Math.tryAdd(product, feeAmount);
        }

        if (isProductSafe == false) {
            revert Forbidden("product amount is not safe");
        }
    }

    function calculateFee(
        uint256 product,
        uint8 fee
    ) public pure returns (uint256) {
        // Range from 0.01% -> 100%
        (bool isProductSafe, uint256 productWifFee) = Math.tryMul(
            product,
            uint256(fee)
        );
        if (isProductSafe == false) {
            revert Forbidden("product wif fee is not safe");
        }

        (bool isFeeSafe, uint256 feeAmount) = Math.tryDiv(
            productWifFee,
            10_000
        );
        if (isFeeSafe == false) {
            revert Forbidden("fee is not safe");
        }

        return feeAmount;
    }

    function calculateFeeRate(
        uint256 product,
        MakerOrTaker direction
    ) public pure returns (uint8 fee) {
        // TODO: update this formula
        fee = 100;
    }

    /**
     * ============================================================
     * ============================================================
     * ============================================================
     * ============================================================
     * ============================================================
     */

    function _isValidSignature(
        bytes32 orderId_,
        uint256 amount_,
        address token_,
        address caller,
        bytes calldata signature_
    ) internal view returns (bool) {
        bytes32 encodeData = keccak256(
            abi.encodePacked(orderId_, amount_, token_, caller)
        );
        address recoveryAddress = encodeData.toEthSignedMessageHash().recover(
            signature_
        );
        return recoveryAddress == _state.signatureVerifier;
    }

    modifier nonExistingOrder(bytes32 orderId_) {
        if (_state.existingOrders[orderId_]) {
            revert OrderExisted(orderId_);
        }

        _;
    }
}
