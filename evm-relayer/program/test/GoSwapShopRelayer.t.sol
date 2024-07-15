// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "forge-std/Test.sol";
// import "forge-std/console.sol";

// import "@modules/wormhole/WormholeSimulator.sol";
// import "@modules/token/IWETH.sol";
// import "@modules/wormhole/ITokenBridge.sol";

// import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
// import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
// import "../src/goswapshop-relayer/GoSwapShopRelayerStructs.sol";
// import "../src/goswapshop-relayer/GoSwapShopRelayer.sol";

/**
 * @notice TODO: continue writing this
 */
contract GoSwapShopRelayerTest {/* is Test */
    // using MessageHashUtils for bytes32;
    // // guardian private key for simulated signing of Wormhole messages
    // uint256 guardianSigner;

    // // relayer fee precision
    // uint32 relayerFeePrecision;

    // // ethereum test info
    // uint16 ethereumChainId;
    // address ethereumTokenBridge;
    // address weth;

    // // contract instances
    // IWETH wavax;
    // IWormhole wormhole;
    // ITokenBridge bridge;
    // WormholeSimulator wormholeSimulator;
    // GoSwapShopRelayer goSwapShopRelayer;
    // uint256 firstChainId = vm.envUint("TESTING_AVAX_FORK_CHAINID");
    // uint256 secondChainId = 2;

    // address defaultOwnerAddress;
    // address signatureVerifier;
    // uint256 signatureVerifierPrivateKey;
    // address theBuyer;
    // address theSeller;
    // uint8 takerFee = 100; // 0.01%
    // uint8 makerFee = 100; // 0.01%

    // // used to compute balance changes before/after redeeming token transfers
    // struct Balances {
    //     uint256 recipientBefore;
    //     uint256 recipientAfter;
    //     uint256 relayerBefore;
    //     uint256 relayerAfter;
    // }

    // /**
    //  * @notice Sets up the wormholeSimulator contracts and deploys HelloToken
    //  * contracts before each test is executed.
    //  */
    // function setUp() public {
    //     // verify that we're using the correct fork (AVAX mainnet in this case)
    //     require(block.chainid == firstChainId, "wrong evm");

    //     // this will be used to sign Wormhole messages
    //     guardianSigner = uint256(vm.envBytes32("TESTING_DEVNET_GUARDIAN"));
    //     defaultOwnerAddress = vm.envAddress("DEFAULT_ADMIN_ADDRESS");
    //     signatureVerifierPrivateKey = vm.envUint("SIGNATURE_VERIFIER_PRIVATE_KEY");
    //     signatureVerifier = vm.addr(uint256(signatureVerifierPrivateKey));
    //     theBuyer = vm.envAddress("THE_BUYER_ADDRESS");
    //     theSeller = vm.envAddress("THE_SELLER_ADDRESS");

    //     // we may need to interact with Wormhole throughout the test
    //     wormhole = IWormhole(vm.envAddress("TESTING_AVAX_WORMHOLE_ADDRESS"));

    //     // set up Wormhole using Wormhole existing on AVAX mainnet
    //     wormholeSimulator = new SigningWormholeSimulator(wormhole, guardianSigner);

    //     // verify Wormhole state from fork
    //     require(
    //         wormhole.chainId() == uint16(vm.envUint("TESTING_AVAX_WORMHOLE_CHAINID")),
    //         "wrong chainId"
    //     );
    //     require(
    //         wormhole.messageFee() == vm.envUint("TESTING_AVAX_WORMHOLE_MESSAGE_FEE"),
    //         "wrong messageFee"
    //     );
    //     require(
    //         wormhole.getCurrentGuardianSetIndex() == uint32(
    //             vm.envUint("TESTING_AVAX_WORMHOLE_GUARDIAN_SET_INDEX")
    //         ),
    //         "wrong guardian set index"
    //     );

    //     // instantiate wavax interface
    //     wavax = IWETH(vm.envAddress("TESTING_WRAPPED_AVAX_ADDRESS"));

    //     // instantiate TokenBridge interface
    //     bridge = ITokenBridge(vm.envAddress("TESTING_AVAX_BRIDGE_ADDRESS"));

    //     // set the ethereum token bridge, chainId and WETH addresses
    //     ethereumTokenBridge = vm.envAddress("TESTING_ETH_BRIDGE_ADDRESS");
    //     ethereumChainId = uint16(vm.envUint("TESTING_ETH_WORMHOLE_CHAINID"));
    //     weth = vm.envAddress("TESTING_WRAPPED_ETH_ADDRESS");

    //     // relayer fee percentage and precision
    //     relayerFeePrecision = 1e6;
    //     uint32 relayerFeePercentage = 1000; // 10 basis point

    //     // deploy the GoSwapShopRelayer contract
    //     goSwapShopRelayer = new GoSwapShopRelayer(
    //         defaultOwnerAddress,
    //         signatureVerifier,
    //         address(wormhole),
    //         address(bridge),
    //         wormhole.chainId(),
    //         uint8(1), // wormhole finality
    //         relayerFeePrecision,
    //         relayerFeePercentage
    //     );
    // }

    // function wrapAvax(uint256 amount) internal {
    //     // wrap specified amount of WAVAX
    //     wavax.deposit{value: amount}();
    // }

    // function addressToBytes32(address address_) internal pure returns (bytes32) {
    //     // convert address to bytes32 (left-zero-padded if less than 20 bytes)
    //     return bytes32(uint256(uint160(address_)));
    // }

    // function normalizeAmount(
    //     uint256 amount,
    //     uint8 decimals
    // ) internal pure returns(uint256) {
    //     // Truncate amount if decimals are greater than 8, this is to support
    //     // blockchains that can't handle uint256 type amounts.
    //     if (decimals > 8) {
    //         amount /= 10 ** (decimals - 8);
    //     }
    //     return amount;
    // }

    // function denormalizeAmount(
    //     uint256 amount,
    //     uint8 decimals
    // ) internal pure returns(uint256) {
    //     // convert truncated amount back to original format
    //     if (decimals > 8) {
    //         amount *= 10 ** (decimals - 8);
    //     }
    //     return amount;
    // }

    // function getBalance(
    //     address token,
    //     address wallet
    // ) internal view returns (uint256 balance) {
    //     (, bytes memory queriedBalance) =
    //         token.staticcall(
    //             abi.encodeWithSelector(IERC20.balanceOf.selector, wallet)
    //         );
    //     balance = abi.decode(queriedBalance, (uint256));
    // }

    // function getDecimals(
    //     address token
    // ) internal view returns (uint8 decimals) {
    //     (,bytes memory queriedDecimals) = token.staticcall(
    //         abi.encodeWithSignature("decimals()")
    //     );
    //     decimals = abi.decode(queriedDecimals, (uint8));
    // }

    // function logBalance(string memory key, address wallet, address token) internal view {
    //     console.logString(
    //         string(abi.encode('============= ', key, ' ============='))
    //     );
    //     console.logUint(getBalance(token, wallet));
    //     console.logString(
    //         string(abi.encode('============= ', key, ' ============='))
    //     );
    // }

    // function getSignature(bytes32 orderId, uint256 amount, address token, address creator) internal returns (bytes memory signature) {
    //     vm.startPrank(signatureVerifier);
    //     bytes32 digest = keccak256(abi.encodePacked(
    //         orderId,
    //         amount,
    //         token,
    //         creator
    //     )).toEthSignedMessageHash();
    //     (uint8 v, bytes32 r, bytes32 s) = vm.sign(signatureVerifierPrivateKey, digest);
    //     signature = abi.encodePacked(r, s, v);
    //     vm.stopPrank();
    // }

    // function this_placeAnOrder(
    //     bytes32 orderId,
    //     uint256 amount,
    //     uint16 targetChainId,
    //     address token
    // ) internal {
    //     bytes memory placeAnOrderSignature = getSignature(orderId, amount, token, theBuyer);
    //     vm.startPrank(theBuyer);
    //     vm.deal(theBuyer, 100 ether);
    //     uint256 totalAmount = goSwapShopRelayer.calculateProduct(
    //         amount,
    //         takerFee,
    //         GoSwapShopRelayerStructs.MakerOrTaker.Taker
    //     );
    //     // wrap some avax
    //     wrapAvax(totalAmount);

    //     // approve the GoSwapShopRelayer to spend wavax
    //     SafeERC20.forceApprove(
    //         IERC20(token),
    //         address(goSwapShopRelayer),
    //         totalAmount
    //     );
    //     logBalance("[PLACE AN ORDER] BALANCE BEFORE", theBuyer, token);
    //     goSwapShopRelayer.placeAnOrder(
    //         targetChainId,
    //         orderId,
    //         amount,
    //         token,
    //         placeAnOrderSignature
    //     );
    //     logBalance("[PLACE AN ORDER] BALANCE AFTER", theBuyer, token);
    //     vm.stopPrank();
    // }

    // function this_cancelTheOrder(
    //     address token,
    //     bytes32 orderId
    // ) internal {
    //     bytes memory cancelTheOrderSignature = getSignature(orderId, 0, token, theBuyer);

    //     vm.startPrank(theBuyer);
    //     logBalance("[CANCEL THE ORDER] BALANCE BEFORE", theBuyer, token);
    //      goSwapShopRelayer.cancelTheOrder(
    //         orderId,
    //         token,
    //         cancelTheOrderSignature
    //     );
    //     logBalance("[CANCEL THE ORDER] BALANCE AFTER", theBuyer, token);
    //     vm.stopPrank();
    // }

    // function this_confirmTheOrder(bytes32 orderId) internal {
    //     vm.startPrank(theBuyer);
    //     goSwapShopRelayer.confirmTheOrder(orderId);
    //     console.logString("Order confirmed");
    //     vm.stopPrank();
    // }

    // function this_createAnOrder(bytes32 orderId, uint256 amount) internal {
    //     vm.startPrank(theSeller);
    //     vm.deal(theSeller, 100 ether);
    //     goSwapShopRelayer.createAnOrder(orderId, amount);
    //     vm.stopPrank();
    // }

    // function this_claimTheOrder(bytes32 orderId, address token) internal {
    //     bytes memory claimTheOrderSignature = getSignature(orderId, 0, token, theSeller);
    //     vm.startPrank(theSeller);
    //     logBalance("[CLAIM THE ORDER] SELLER BALANCE BEFORE", theSeller, token);
    //     goSwapShopRelayer.claimTheOrder(orderId, token, claimTheOrderSignature);
    //     logBalance("[CLAIM THE ORDER] SELLER BALANCE AFTER", theSeller, token);
    //     vm.stopPrank();
    // }

    // function test_placeAndCancelAnOrder() public {
    //     bytes32 newOrderId = keccak256('THIS_IS_A_UNIQUE_ORDER_ID');
    //     uint256 amount = 1 ether;
    //     uint16 targetChainId = uint16(wormhole.chainId());
    //     address token = address(wavax);
       
    //     this_placeAnOrder(newOrderId, amount, targetChainId, token);
    //     this_cancelTheOrder(token, newOrderId);
    // }

    // function test_placeAndConfirmThenClaimAnOrder() public {
    //     bytes32 buyerOrderId = keccak256('THIS_IS_A_UNIQUE_ORDER_ID_1');
    //     bytes32 sellerOrderId = keccak256('THIS_IS_A_UNIQUE_ORDER_ID_2');
    //     uint256 amount = 1 ether;
    //     uint16 targetChainId = uint16(wormhole.chainId());
    //     address token = address(wavax);

    //     this_createAnOrder(sellerOrderId, amount);
    //     this_placeAnOrder(buyerOrderId, amount, targetChainId, token);
    //     this_confirmTheOrder(buyerOrderId);
    //     this_claimTheOrder(sellerOrderId, token);
    // }

    // function getTransferWithPayloadMessage(
    //     ITokenBridge.TransferWithPayload memory transfer,
    //     uint16 emitterChainId,
    //     bytes32 emitterAddress
    // ) internal returns (bytes memory signedTransfer) {
    //     // construct `TransferWithPayload` Wormhole message
    //     IWormhole.VM memory vm;

    //     // set the vm values inline
    //     vm.version = uint8(1);
    //     vm.timestamp = uint32(block.timestamp);
    //     vm.emitterChainId = emitterChainId;
    //     vm.emitterAddress = emitterAddress;
    //     vm.sequence = wormhole.nextSequence(
    //         address(uint160(uint256(emitterAddress)))
    //     );
    //     vm.consistencyLevel = bridge.finality();
    //     vm.payload = bridge.encodeTransferWithPayload(transfer);

    //     // encode the bservation
    //     signedTransfer = wormholeSimulator.encodeAndSignMessage(vm);
    // }

    // // /**
    // //  * @notice This test confirms that the contracts are able to serialize and
    // //  * deserialize the SwapShopVault message correctly.
    // //  */
    // // function testMessageDeserialization(bytes32 orderId, bytes32 targetRecipient) public {
    // //     vm.assume(targetRecipient != bytes32(0));
    // //     vm.assume(orderId != bytes32(0));

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedMessage = swapshopVault.encodePayload(
    // //         orderId,
    // //         targetRecipient
    // //     );
    // //     // decode the message by calling the decodePayload method
    // //     (bytes32 _orderId, bytes32 _targetRecipient) =
    // //         swapshopVault.decodePayload(encodedMessage);

    // //     // verify the parsed output
    // //     assertEq(_orderId, orderId);
    // //     assertEq(_targetRecipient, targetRecipient);
    // // }

    // // /**
    // //  * @notice This test confirms that decodePayload reverts when a message
    // //  * has an unexpected orderId.
    // //  */
    // // function testIncorrectMessagePayload() public {
    // //     // create garbage targetRecipient address
    // //     bytes32 targetRecipient = bytes32(uint256(uint160(address(this))));

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(2), // encode wrong payloadID
    // //             targetRecipient: targetRecipient
    // //         })
    // //     );

    // //     // expect a revert when trying to decode a message the wrong payloadID
    // //     vm.expectRevert("invalid payloadID");
    // //     helloToken.decodePayload(encodedMessage);
    // // }

    // // /**
    // //  * @notice This test confirms that decodePayload reverts when a message
    // //  * is an unexpected length.
    // //  */
    // // function testIncorrectMessageLength() public {
    // //     // create garbage targetRecipient address
    // //     bytes32 targetRecipient = bytes32(uint256(uint160(address(this))));

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(1),
    // //             targetRecipient: targetRecipient
    // //         })
    // //     );

    // //     // add some bytes to the encodedMessage
    // //     encodedMessage = abi.encodePacked(
    // //         encodedMessage,
    // //         uint256(42000) // random bytes
    // //     );

    // //     // expect a revert when trying to decode a message an invalid length
    // //     vm.expectRevert("invalid payload length");
    // //     helloToken.decodePayload(encodedMessage);
    // // }

    // // /**
    // //  * @notice This test confirms that the owner can correctly register a foreign emitter
    // //  * with the HelloToken contracts.
    // //  */
    // // function testRegisterEmitter(
    // //     bytes32 newEmitterAddress
    // // ) public {
    // //     vm.assume(newEmitterAddress != bytes32(0));

    // //     // cache the new emitter info
    // //     uint16 newEmitterChainId = ethereumChainId;

    // //     // register the emitter with the owner's wallet
    // //     helloToken.registerEmitter(newEmitterChainId, newEmitterAddress);

    // //     // verify that the contract state was updated correctly
    // //     bytes32 emitterInContractState = helloToken.getRegisteredEmitter(
    // //         ethereumChainId
    // //     );
    // //     assertEq(emitterInContractState, newEmitterAddress);
    // // }

    // // /**
    // //  * @notice This test confirms that ONLY the owner can register a foreign emitter
    // //  * with the HelloToken contracts.
    // //  */
    // // function testRegisterEmitterNotOwner(
    // //     bytes32 newEmitterAddress
    // // ) public {
    // //     vm.assume(newEmitterAddress != bytes32(0));

    // //     // cache the new emitter info
    // //     uint16 newEmitterChainId = ethereumChainId;

    // //     // prank the caller address to something different than the owner's address
    // //     vm.prank(address(wormholeSimulator));

    // //     // expect the registerEmitter call to revert
    // //     vm.expectRevert("caller not the owner");
    // //     helloToken.registerEmitter(newEmitterChainId, newEmitterAddress);
    // // }

    // // /**
    // //  * @notice This test confirms that the owner can correctly update the
    // //  * relayer fee.
    // //  */
    // // function testUpdateRelayerFee(uint32 relayerFeePercentage) public {
    // //     vm.assume(
    // //         relayerFeePercentage < helloToken.feePrecision() &&
    // //         relayerFeePercentage != helloToken.relayerFeePercentage()
    // //     );

    // //     // set the new relayer fee
    // //     helloToken.updateRelayerFee(
    // //         relayerFeePercentage,
    // //         relayerFeePrecision
    // //     );
    // //     assertEq(helloToken.relayerFeePercentage(), relayerFeePercentage);
    // // }

    // // /**
    // //  * @notice This test confirms that ONLY the owner can update the relayer fee.
    // //  */
    // // function testUpdateRelayerFeeNotOwner(uint32 relayerFeePercentage) public {
    // //     vm.assume(
    // //         relayerFeePercentage < helloToken.feePrecision() &&
    // //         relayerFeePercentage != helloToken.relayerFeePercentage()
    // //     );

    // //     // prank the caller address to something different than the owner's address
    // //     vm.prank(address(wormholeSimulator));

    // //     // expect the updateRelayerFee call to revert
    // //     vm.expectRevert("caller not the owner");
    // //     helloToken.updateRelayerFee(relayerFeePercentage, relayerFeePrecision);
    // // }

    // // /**
    // //  * @notice This test confirms that the owner can't update the relayerFeePrecision
    // //  * to a value of zero.
    // //  */
    // // function testUpdateRelayerFeeZeroPrecision(uint32 relayerFeePercentage) public {
    // //     // expect the updateRelayerFee call to revert
    // //     vm.expectRevert("precision must be > 0");
    // //     helloToken.updateRelayerFee(
    // //         relayerFeePercentage,
    // //         0
    // //     );
    // // }

    // // /**
    // //  * @notice This test confirms that the owner can't update the relayerFeePercentage
    // //  * to a value greater than the feePrecision.
    // //  */
    // // function testUpdateRelayerFeePrecisionLessThanPercentage() public {
    // //     uint32 relayerFeePercentage = 42000;
    // //     uint32 relayerFeePrecision_ = relayerFeePercentage - 69;

    // //     // expect the updateRelayerFee call to revert
    // //     vm.expectRevert("relayer fee percentage must be < precision");
    // //     helloToken.updateRelayerFee(
    // //         relayerFeePercentage,
    // //         relayerFeePrecision_
    // //     );
    // // }

    // /**
    //  * @notice This test confirms that the `sendTokensWithPayload` method correctly sends
    //  * a token with an addtional payload.
    //  */
    // function test_SendTokensWithPayload(
    //     bytes32 targetRecipient,
    //     bytes32 ethereumEmitter
    // ) public {
    //     vm.assume(targetRecipient != bytes32(0));
    //     vm.assume(
    //         ethereumEmitter != bytes32(0) &&
    //         bytes12(ethereumEmitter) == 0
    //     );

    //     bytes32 buyerOrderId = keccak256('THIS_IS_A_ORDER_ID_22');
    //     uint256 amount = 1 ether;
    //     uint16 targetChainId = ethereumChainId;
    //     address token = address(wavax);

    //     this_placeAnOrder(
    //         buyerOrderId,
    //         amount,
    //         targetChainId,
    //         token
    //     );

    //     // fund to goSwapShopRelayer. Just test for now
    //     vm.startPrank(address(goSwapShopRelayer));
    //     vm.deal(address(goSwapShopRelayer), 100 ether);
    //     // wrap some avax
    //     wrapAvax(amount);
    //     console.logString("Funded to GoSwapShopRelayer");
    //     vm.stopPrank();


    //     // start listening to events
    //     vm.recordLogs();

    //     // call the source GoSwapShopRelayer contract to transfer tokens to ethereum
    //     vm.startPrank(defaultOwnerAddress);
    //     // register the emitter on the source contract        
    //     goSwapShopRelayer.registerEmitter(
    //         targetChainId,
    //         ethereumEmitter
    //     );
    //     vm.stopPrank();
        
    //     vm.startPrank(theBuyer);
    //     uint64 sequence = goSwapShopRelayer.sendTokensWithPayload(
    //         0, // opt out of batching
    //         buyerOrderId,
    //         token,
    //         targetRecipient
    //     );
    //     console.logString("Sent to token bridge");
    //     vm.stopPrank();

    //     // record the emitted Wormhole message
    //     Vm.Log[] memory logs = vm.getRecordedLogs();
    //     require(logs.length > 0, "no events recorded");

    //     // find published wormhole messages from log
    //     Vm.Log[] memory publishedMessages =
    //         wormholeSimulator.fetchWormholeMessageFromLog(logs);

    //     // simulate signing the Wormhole message
    //     // NOTE: in the wormhole-sdk, signed Wormhole messages are referred to as signed VAAs
    //     bytes memory encodedMessage = wormholeSimulator.fetchSignedMessageFromLogs(
    //         publishedMessages[0],
    //         goSwapShopRelayer.chainId(),
    //         address(goSwapShopRelayer)
    //     );

    //     // parse and verify the message
    //     (
    //         IWormhole.VM memory wormholeMessage,
    //         bool valid,
    //         string memory reason
    //     ) = wormhole.parseAndVerifyVM(encodedMessage);
    //     require(valid, reason);

    //     // call the token bridge to parse the TransferWithPayload message
    //     ITokenBridge.TransferWithPayload memory transfer =
    //         bridge.parseTransferWithPayload(wormholeMessage.payload);

    //     /**
    //      * The token bridge normalizes the transfer amount to support
    //      * blockchains that don't support type uint256. We need to normalize the
    //      * amount we passed to the contract to compare the value against what
    //      * is encoded in the payload.
    //      */
    //     uint256 _transferAmount = goSwapShopRelayer.calculateProduct(
    //         amount,
    //         takerFee,
    //         GoSwapShopRelayerStructs.MakerOrTaker.Taker
    //     );
    //     assertEq(
    //         transfer.amount,
    //         normalizeAmount(_transferAmount, getDecimals(token)),
    //         "transfer amount is not equal to normalize amount"
    //     );

    //     // verify the remaining TransferWithPayload values
    //     assertEq(transfer.tokenAddress, addressToBytes32(token), "invalid token");
    //     assertEq(transfer.tokenChain, goSwapShopRelayer.chainId(), "invalid chain");
    //     assertEq(transfer.to, ethereumEmitter, "");
    //     assertEq(transfer.toChain, targetChainId, "invalid chain");
    //     assertEq(transfer.fromAddress, addressToBytes32(address(goSwapShopRelayer)), "invalid from");
    //     assertEq(transfer.amount > 0, true, "invalid amount");

    //     // verify VAA values
    //     assertEq(wormholeMessage.sequence, sequence, "invalid sequence");
    //     assertEq(wormholeMessage.nonce, 0, "invalid batch"); // batchID
    //     assertEq(wormholeMessage.consistencyLevel, goSwapShopRelayer.wormholeFinality(), "invalid consistency level");

    //     // parse additional payload and verify the values
    //     GoSwapShopRelayerStructs.GoSwapShopRelayerMessage memory _msg =
    //         goSwapShopRelayer.decodePayload(transfer.payload);

    //     assertEq(_msg.payloadID, 1, "invalid payload ID");
    //     assertEq(_msg.targetRecipient, targetRecipient, "invalid recipient");
    // }

    // // /**
    // //  * @notice This test confirms that the `sendTokensWithPayload` method reverts when
    // //  * the `amount` is zero.
    // //  */
    // // function testSendTokensWithPayloadAmountZero() public {
    // //     uint256 amount = 0;
    // //     address token = address(wavax);
    // //     bytes32 targetRecipient = addressToBytes32(address(this));

    // //     // call `sendTokensWithPayload` should revert
    // //     vm.expectRevert("amount must be greater than 0");
    // //     helloToken.sendTokensWithPayload(
    // //         token,
    // //         amount,
    // //         ethereumChainId,
    // //         0, // opt out of batching
    // //         targetRecipient
    // //     );
    // // }

    // // /**
    // //  * @notice This test confirms that the `sendTokensWithPayload` method reverts when
    // //  * the `targetRecipient` is the zero address (bytes32 format).
    // //  */
    // // function testSendTokensWithPayloadInvalidRecipient() public {
    // //     uint256 amount = 1e18;
    // //     address token = address(wavax);
    // //     bytes32 targetRecipient = bytes32(0);

    // //     // call `sendTokensWithPayload` should revert
    // //     vm.expectRevert("targetRecipient cannot be bytes32(0)");
    // //     helloToken.sendTokensWithPayload(
    // //         token,
    // //         amount,
    // //         ethereumChainId,
    // //         0, // opt out of batching
    // //         targetRecipient
    // //     );
    // // }

    // // /**
    // //  * @notice This test confirms that the `sendTokensWithPayload` method reverts when
    // //  * the `token` is the zero address.
    // //  */
    // // function testSendTokensWithPayloadInvalidToken() public {
    // //     uint256 amount = 1e18;
    // //     address token = address(0);
    // //     bytes32 targetRecipient = addressToBytes32(address(this));

    // //     // call `sendTokensWithPayload` should revert
    // //     vm.expectRevert("token cannot be address(0)");
    // //     helloToken.sendTokensWithPayload(
    // //         token,
    // //         amount,
    // //         ethereumChainId,
    // //         0, // opt out of batching
    // //         targetRecipient
    // //     );
    // // }

    // // /**
    // //  * @notice This test confirms that the `sendTokensWithPayload` method reverts when
    // //  * the targetChain does not have a registered emitter.
    // //  */
    // // function testSendTokensWithPayloadInvalidTargetContract() public {
    // //     uint256 amount = 1e19;
    // //     bytes32 targetRecipient = addressToBytes32(address(this));
    // //     uint16 targetChain = 6;

    // //     // call `sendTokensWithPayload` should revert
    // //     vm.expectRevert("emitter not registered");
    // //     helloToken.sendTokensWithPayload(
    // //         address(wavax),
    // //         amount,
    // //         targetChain,
    // //         0, // opt out of batching
    // //         targetRecipient
    // //     );
    // // }

    // // /**
    // //  * @notice This test confirms that the `sendTokensWithPayload` method reverts when
    // //  * the normalized amount is zero.
    // //  */
    // // function testSendTokensWithPayloadInvalidNormalizedAmount(uint256 amount) public {
    // //     vm.assume(amount > 0 && amount < 1e10);

    // //     // NOTE: the token needs to have 18 decimals for this test to pass
    // //     address token = address(wavax);
    // //     bytes32 targetRecipient = addressToBytes32(address(this));
    // //     uint16 targetChain = 69;

    // //     // register the emitter on the source contract
    // //     helloToken.registerEmitter(
    // //         targetChain,
    // //         targetRecipient
    // //     );

    // //     // call `sendTokensWithPayload` should revert
    // //     vm.expectRevert("normalized amount must be > 0");
    // //     helloToken.sendTokensWithPayload(
    // //         token,
    // //         amount,
    // //         targetChain,
    // //         0, // opt out of batching
    // //         targetRecipient
    // //     );
    // // }

    // /**
    //  * @notice This test confirms that GoSwapShopRelayer correctly redeems wrapped
    //  * tokens to the encoded recipient and handles relayer payments correctly.
    //  */
    // function testRedeemTransferWithPayloadWrappedToken(uint256 amount) public {
    //     vm.assume(
    //         amount > 1e10 &&
    //         amount < type(uint256).max / goSwapShopRelayer.relayerFeePercentage()
    //     );

    //     // create a bogus eth emitter address
    //     bytes32 ethereumEmitter = addressToBytes32(address(this));

    //     // Fetch the wrapped weth contract on avalanche, since the token
    //     // address encoded in the signedMessage is weth from Ethereum.
    //     address wrappedAsset = bridge.wrappedAsset(
    //         ethereumChainId,
    //         addressToBytes32(weth)
    //     );
    //     uint8 tokenDecimals = getDecimals(wrappedAsset);

    //     // Normalize and denormalize the transfer amount the same way the
    //     // token bridge does.
    //     uint256 normalizedAmount = normalizeAmount(amount, tokenDecimals);
    //     // uint256 denormalizedAmount = denormalizeAmount(
    //     //     normalizedAmount,
    //     //     tokenDecimals
    //     // );
    
    //     // encode the message by calling the encodePayload method
    //     bytes memory encodedGoSwapShopRelayerMessage = goSwapShopRelayer.encodePayload(
    //         GoSwapShopRelayerStructs.GoSwapShopRelayerMessage({
    //             payloadID: uint8(1),
    //             targetRecipient: addressToBytes32(address(goSwapShopRelayer))
    //         })
    //     );

    //     // Create a simulated version of the wormhole message that the
    //     // GoSwapShop contract will emit.
    //     ITokenBridge.TransferWithPayload memory transfer =
    //         ITokenBridge.TransferWithPayload({
    //             payloadID: uint8(3), // payload3 transfer
    //             amount: normalizedAmount,
    //             tokenAddress: addressToBytes32(weth),
    //             tokenChain: ethereumChainId,
    //             to: addressToBytes32(address(goSwapShopRelayer)),
    //             toChain: goSwapShopRelayer.chainId(),
    //             fromAddress: ethereumEmitter,
    //             payload: encodedGoSwapShopRelayerMessage
    //         });

    //     // Encode the TransferWithPayload struct and simulate signing
    //     // the message with the devnet guardian key.
    //     bytes memory signedMessage = getTransferWithPayloadMessage(
    //         transfer,
    //         ethereumChainId,
    //         addressToBytes32(ethereumTokenBridge)
    //     );

    //     // register the emitter on the source contract
    //     vm.startPrank(defaultOwnerAddress);
    //     goSwapShopRelayer.registerEmitter(ethereumChainId, ethereumEmitter);
    //     vm.stopPrank();

    //     // store balances in the Balances struct (reduces local variable count)
    //     Balances memory balances;
    //     balances.recipientBefore = getBalance(wrappedAsset, address(goSwapShopRelayer));
    //     // balances.relayerBefore = getBalance(wrappedAsset, vm.addr(guardianSigner));
    //     /**
    //      * Call redeemTransferWithPayload using the signed VM. Prank the
    //      * calling address to confirm that the relayer fees are paid
    //      * out correctly.
    //      */
    //     vm.prank(vm.addr(guardianSigner));
    //     goSwapShopRelayer.redeemTransferWithPayload(signedMessage);

    //     // check balance of wrapped weth after redeeming the transfer
    //     balances.recipientAfter = getBalance(wrappedAsset, address(goSwapShopRelayer));
    //     // balances.relayerAfter = getBalance(wrappedAsset, vm.addr(guardianSigner));

    //     // // compute the relayer fee
    //     // uint256 relayerFee = goSwapShopRelayer.calculateRelayerFee(denormalizedAmount);

    //     // // confirm balance changes on the caller and recipient
    //     // assertEq(
    //     //     balances.recipientAfter - balances.recipientBefore,
    //     //     denormalizedAmount - relayerFee,
    //     //     "invalid balance after"
    //     // );
    //     // assertEq(balances.relayerAfter - balances.relayerBefore, relayerFee, "invalid relayer fee");
    // }

    // // /**
    // //  * @notice This test confirms that HelloToken correctly redeems native
    // //  * tokens to the encoded recipient and handles relayer payments correctly.
    // //  * In this case, native tokens means that the token originates on the
    // //  * target blockchain (the HelloToken chain).
    // //  */
    // // function testRedeemTransferWithPayloadNativeToken(
    // //     uint256 amount
    // // ) public {
    // //     // save the WAVAX address
    // //     address wavaxAddress = address(wavax);
    // //     uint8 tokenDecimals = getDecimals(wavaxAddress);

    // //     // create a bogus eth emitter address
    // //     bytes32 ethereumEmitter = addressToBytes32(address(this));

    // //     // can't transfer more than the outstanding supply
    // //     vm.assume(
    // //         amount > 1e10 &&
    // //         amount < bridge.outstandingBridged(wavaxAddress)
    // //     );

    // //     // Normalize and denormalize the transfer amount the same way the
    // //     // token bridge does.
    // //     uint256 normalizedAmount = normalizeAmount(amount, tokenDecimals);
    // //     uint256 denormalizedAmount = denormalizeAmount(normalizedAmount, tokenDecimals);

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedHelloTokenMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(1),
    // //             targetRecipient: addressToBytes32(address(this))
    // //         })
    // //     );

    // //     /**
    // //      * Create a simulated version of the wormhole message that the
    // //      * HelloToken contract will emit. The token bridge will convert
    // //      * the wrapped avax token address to the native token on the target chain,
    // //      * so we need to encode the wavax address in the TransferWithPayload
    // //      * struct.
    // //      */
    // //     ITokenBridge.TransferWithPayload memory transfer =
    // //         ITokenBridge.TransferWithPayload({
    // //             payloadID: uint8(3), // payload3 transfer
    // //             amount: normalizedAmount,
    // //             tokenAddress: addressToBytes32(wavaxAddress),
    // //             tokenChain: helloToken.chainId(),
    // //             to: addressToBytes32(address(helloToken)),
    // //             toChain: helloToken.chainId(),
    // //             fromAddress: ethereumEmitter,
    // //             payload: encodedHelloTokenMessage
    // //         });

    // //     // Encode the TransferWithPayload struct and simulate signing
    // //     // the message with the devnet guardian key.
    // //     bytes memory signedMessage = getTransferWithPayloadMessage(
    // //         transfer,
    // //         ethereumChainId,
    // //         addressToBytes32(ethereumTokenBridge)
    // //     );

    // //     // register the emitter on the source contract
    // //     helloToken.registerEmitter(ethereumChainId, ethereumEmitter);

    // //     // store balances in the Balances struct (reduces local variable count)
    // //     Balances memory balances;
    // //     balances.recipientBefore = getBalance(wavaxAddress, address(this));
    // //     balances.relayerBefore = getBalance(wavaxAddress, vm.addr(guardianSigner));

    // //     /**
    // //      * Call redeemTransferWithPayload using the signed VM. Prank the
    // //      * calling address to confirm that the relayer fees are paid
    // //      * out correctly.
    // //      */
    // //     vm.prank(vm.addr(guardianSigner));
    // //     helloToken.redeemTransferWithPayload(signedMessage);

    // //     // check balance of wavax after redeeming the transfer
    // //     balances.recipientAfter = getBalance(wavaxAddress, address(this));
    // //     balances.relayerAfter = getBalance(wavaxAddress, vm.addr(guardianSigner));

    // //     // compute the relayer fee
    // //     uint256 relayerFee = helloToken.calculateRelayerFee(denormalizedAmount);

    // //     // confirm balance changes on the caller and recipient
    // //     assertEq(
    // //         balances.recipientAfter - balances.recipientBefore,
    // //         denormalizedAmount - relayerFee
    // //     );
    // //     assertEq(balances.relayerAfter - balances.relayerBefore, relayerFee);
    // // }

    // // /**
    // //  * @notice This test confirms that HelloToken correctly redeems wrapped
    // //  * tokens to the encoded recipient and handles relayer payments correctly.
    // //  * This test explicitly sets the relayerFeePercentage to zero to confirm
    // //  * that the recipient receives the full amount when relayer fees are
    // //  * disabled.
    // //  */
    // // function testRedeemTransferWithPayloadWrappedTokenZeroRelayerFee(
    // //     uint256 amount
    // // ) public {
    // //     vm.assume(
    // //         amount > 1e10 &&
    // //         amount < type(uint256).max / helloToken.relayerFeePercentage()
    // //     );

    // //     // create a bogus eth emitter address
    // //     bytes32 ethereumEmitter = addressToBytes32(address(this));

    // //     // Fetch the wrapped weth contract on avalanche, since the token
    // //     // address encoded in the signedMessage is weth from Ethereum.
    // //     address wrappedAsset = bridge.wrappedAsset(
    // //         ethereumChainId,
    // //         addressToBytes32(weth)
    // //     );
    // //     uint8 tokenDecimals = getDecimals(wrappedAsset);

    // //     // Normalize and denormalize the transfer amount the same way the
    // //     // token bridge does.
    // //     uint256 normalizedAmount = normalizeAmount(amount, tokenDecimals);
    // //     uint256 denormalizedAmount = denormalizeAmount(
    // //         normalizedAmount,
    // //         tokenDecimals
    // //     );

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedHelloTokenMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(1),
    // //             targetRecipient: addressToBytes32(address(this))
    // //         })
    // //     );

    // //     // Create a simulated version of the wormhole message that the
    // //     // HelloToken contract will emit.
    // //     ITokenBridge.TransferWithPayload memory transfer =
    // //         ITokenBridge.TransferWithPayload({
    // //             payloadID: uint8(3), // payload3 transfer
    // //             amount: normalizedAmount,
    // //             tokenAddress: addressToBytes32(weth),
    // //             tokenChain: ethereumChainId,
    // //             to: addressToBytes32(address(helloToken)),
    // //             toChain: helloToken.chainId(),
    // //             fromAddress: ethereumEmitter,
    // //             payload: encodedHelloTokenMessage
    // //         });

    // //     // Encode the TransferWithPayload struct and simulate signing
    // //     // the message with the devnet guardian key.
    // //     bytes memory signedMessage = getTransferWithPayloadMessage(
    // //         transfer,
    // //         ethereumChainId,
    // //         addressToBytes32(ethereumTokenBridge)
    // //     );

    // //     // register the emitter on the source contract
    // //     helloToken.registerEmitter(ethereumChainId, ethereumEmitter);

    // //     // NOTE: update the relayer fee to 0
    // //     helloToken.updateRelayerFee(0, relayerFeePrecision);
    // //     assertEq(helloToken.relayerFeePercentage(), 0);

    // //     // store balances in the Balances struct (reduces local variable count)
    // //     Balances memory balances;
    // //     balances.recipientBefore = getBalance(wrappedAsset, address(this));
    // //     balances.relayerBefore = getBalance(wrappedAsset, vm.addr(guardianSigner));

    // //     /**
    // //      * Call redeemTransferWithPayload using the signed VM. Prank the
    // //      * calling address to confirm that the relayer fees are paid
    // //      * out correctly.
    // //      */
    // //     vm.prank(vm.addr(guardianSigner));
    // //     helloToken.redeemTransferWithPayload(signedMessage);

    // //     // check balance of wavax after redeeming the transfer
    // //     balances.recipientAfter = getBalance(wrappedAsset, address(this));
    // //     balances.relayerAfter = getBalance(wrappedAsset, vm.addr(guardianSigner));

    // //     // confirm that the recipient received the full amount of tokens
    // //     assertEq(
    // //         balances.recipientAfter - balances.recipientBefore,
    // //         denormalizedAmount
    // //     );

    // //     // confirm that the relayer didn't receive any tokens
    // //     assertEq(balances.relayerAfter - balances.relayerBefore, 0);
    // // }

    // // /**
    // //  * @notice This test confirms that HelloToken correctly redeems native
    // //  * tokens to the encoded recipient and handles relayer payments correctly.
    // //  * This test explicitly calls the redeemTransferWithPayload method from
    // //  * the recipient wallet to confirm that the contract handles relayer
    // //  * payments correctly.
    // //  */
    // // function testRedeemTransferWithPayloadNativeTokenWithoutRelayer(
    // //     uint256 amount
    // // ) public {
    // //     // save the WAVAX address
    // //     address wavaxAddress = address(wavax);
    // //     uint8 tokenDecimals = getDecimals(wavaxAddress);

    // //     // create a bogus eth emitter address
    // //     bytes32 ethereumEmitter = addressToBytes32(address(this));

    // //     // can't transfer more than the outstanding supply
    // //     vm.assume(
    // //         amount > 1e10 &&
    // //         amount < bridge.outstandingBridged(wavaxAddress)
    // //     );

    // //     // Normalize and denormalize the transfer amount the same way the
    // //     // token bridge does.
    // //     uint256 normalizedAmount = normalizeAmount(amount, tokenDecimals);
    // //     uint256 denormalizedAmount = denormalizeAmount(normalizedAmount, tokenDecimals);

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedHelloTokenMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(1),
    // //             targetRecipient: addressToBytes32(address(this))
    // //         })
    // //     );

    // //     /**
    // //      * Create a simulated version of the wormhole message that the
    // //      * HelloToken contract will emit. The token bridge will convert
    // //      * the wrapped avax token address to the native token on the target chain,
    // //      * so we need to encode the wavax address in the TransferWithPayload
    // //      * struct.
    // //      */
    // //     ITokenBridge.TransferWithPayload memory transfer =
    // //         ITokenBridge.TransferWithPayload({
    // //             payloadID: uint8(3), // payload3 transfer
    // //             amount: normalizedAmount,
    // //             tokenAddress: addressToBytes32(wavaxAddress),
    // //             tokenChain: helloToken.chainId(),
    // //             to: addressToBytes32(address(helloToken)),
    // //             toChain: helloToken.chainId(),
    // //             fromAddress: ethereumEmitter,
    // //             payload: encodedHelloTokenMessage
    // //         });

    // //     // Encode the TransferWithPayload struct and simulate signing
    // //     // the message with the devnet guardian key.
    // //     bytes memory signedMessage = getTransferWithPayloadMessage(
    // //         transfer,
    // //         ethereumChainId,
    // //         addressToBytes32(ethereumTokenBridge)
    // //     );

    // //     // register the emitter on the source contract
    // //     helloToken.registerEmitter(ethereumChainId, ethereumEmitter);

    // //     // store balance of the recipient before redeeming the transfer
    // //     Balances memory balances;
    // //     balances.recipientBefore = getBalance(wavaxAddress, address(this));

    // //     // call redeemTransferWithPayload using the signed VM
    // //     helloToken.redeemTransferWithPayload(signedMessage);

    // //     // Check balance of wavax after redeeming the transfer. The recipient
    // //     // should receive the entire amount.
    // //     balances.recipientAfter = getBalance(wavaxAddress, address(this));

    // //     // confirm balance changes on the caller and recipient
    // //     assertEq(
    // //         balances.recipientAfter - balances.recipientBefore,
    // //         denormalizedAmount
    // //     );
    // // }

    // // /**
    // //  * @notice This test confirms that the HelloToken contract reverts
    // //  * when attempting to redeem a transfer for an unattested token.
    // //  */
    // // function testRedeemTransferWithPayloadUnattestedToken() public {
    // //     uint256 amount = 1e18;
    // //     bytes32 ethereumEmitter = addressToBytes32(address(this));

    // //     // instantiate a bogus emitter and token
    // //     IERC20 unattestedToken = IERC20(address(this));

    // //     // Normalize and denormalize the transfer amount the same way the
    // //     // token bridge does.
    // //     uint256 normalizedAmount = normalizeAmount(amount, 18);

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedHelloTokenMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(1),
    // //             targetRecipient: addressToBytes32(address(this))
    // //         })
    // //     );

    // //     /**
    // //      * Create a simulated version of the wormhole message that the
    // //      * HelloToken contract will emit. Encode an unattested token
    // //      * in the payload.
    // //      */
    // //     ITokenBridge.TransferWithPayload memory transfer =
    // //         ITokenBridge.TransferWithPayload({
    // //             payloadID: uint8(3), // payload3 transfer
    // //             amount: normalizedAmount,
    // //             tokenAddress: addressToBytes32(address(unattestedToken)),
    // //             tokenChain: ethereumChainId,
    // //             to: addressToBytes32(address(helloToken)),
    // //             toChain: helloToken.chainId(),
    // //             fromAddress: ethereumEmitter,
    // //             payload: encodedHelloTokenMessage
    // //         });

    // //     // Encode the TransferWithPayload struct and simulate signing
    // //     // the message with the devnet guardian key.
    // //     bytes memory signedMessage = getTransferWithPayloadMessage(
    // //         transfer,
    // //         ethereumChainId,
    // //         addressToBytes32(ethereumTokenBridge)
    // //     );

    // //     // register the emitter on the source contract
    // //     helloToken.registerEmitter(ethereumChainId, ethereumEmitter);

    // //     // redeemTransferWithPayload should revert
    // //     vm.expectRevert("token not attested");
    // //     helloToken.redeemTransferWithPayload(signedMessage);
    // // }

    // //  /**
    // //  * @notice This test confirms that HelloToken correctly reverts
    // //  * when receiving a `TransferWithPayload` message from an
    // //  * unregistered emitter.
    // //  */
    // // function testRedeemTransferWithPayloadInvalidSender() public {
    // //     uint256 amount = 1e18;
    // //     bytes32 ethereumEmitter = addressToBytes32(address(this));

    // //     // save the WAVAX address
    // //     address wavaxAddress = address(wavax);
    // //     uint8 tokenDecimals = getDecimals(wavaxAddress);

    // //     // Normalize and denormalize the transfer amount the same way the
    // //     // token bridge does.
    // //     uint256 normalizedAmount = normalizeAmount(amount, tokenDecimals);

    // //     // encode the message by calling the encodePayload method
    // //     bytes memory encodedHelloTokenMessage = helloToken.encodePayload(
    // //         HelloTokenStructs.HelloTokenMessage({
    // //             payloadID: uint8(1),
    // //             targetRecipient: addressToBytes32(address(this))
    // //         })
    // //     );

    // //     // Create a simulated version of the wormhole message that the
    // //     // HelloToken contract will emit.
    // //     ITokenBridge.TransferWithPayload memory transfer =
    // //         ITokenBridge.TransferWithPayload({
    // //             payloadID: uint8(3), // payload3 transfer
    // //             amount: normalizedAmount,
    // //             tokenAddress: addressToBytes32(wavaxAddress),
    // //             tokenChain: helloToken.chainId(),
    // //             to: addressToBytes32(address(helloToken)),
    // //             toChain: helloToken.chainId(),
    // //             fromAddress: ethereumEmitter,
    // //             payload: encodedHelloTokenMessage
    // //         });

    // //     // Encode the TransferWithPayload struct and simulate signing
    // //     // the message with the devnet guardian key.
    // //     bytes memory signedMessage = getTransferWithPayloadMessage(
    // //         transfer,
    // //         ethereumChainId,
    // //         addressToBytes32(ethereumTokenBridge)
    // //     );

    // //     // NOTE: We purposely don't register an emitter on the HelloToken contract
    // //     // for this test. The redeemTransferWithPayload call should revert for
    // //     // this reason.
    // //     vm.expectRevert("emitter not registered");
    // //     helloToken.redeemTransferWithPayload(signedMessage);
    // // }
}