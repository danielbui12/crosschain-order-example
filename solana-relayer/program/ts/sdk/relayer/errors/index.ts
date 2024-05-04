/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

type ErrorWithCode = Error & { code: number };
type MaybeErrorWithCode = ErrorWithCode | null | undefined;

const createErrorFromCodeLookup: Map<number, () => ErrorWithCode> = new Map();
const createErrorFromNameLookup: Map<string, () => ErrorWithCode> = new Map();

/**
 * InvalidWormholeBridge: 'InvalidWormholeBridge'
 *
 * @category Errors
 * @category generated
 */
export class InvalidWormholeBridgeError extends Error {
  readonly code: number = 0x1770;
  readonly name: string = "InvalidWormholeBridge";
  constructor() {
    super("InvalidWormholeBridge");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidWormholeBridgeError);
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new InvalidWormholeBridgeError());
createErrorFromNameLookup.set(
  "InvalidWormholeBridge",
  () => new InvalidWormholeBridgeError(),
);

/**
 * InvalidWormholeFeeCollector: 'InvalidWormholeFeeCollector'
 *
 * @category Errors
 * @category generated
 */
export class InvalidWormholeFeeCollectorError extends Error {
  readonly code: number = 0x1771;
  readonly name: string = "InvalidWormholeFeeCollector";
  constructor() {
    super("InvalidWormholeFeeCollector");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidWormholeFeeCollectorError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1771,
  () => new InvalidWormholeFeeCollectorError(),
);
createErrorFromNameLookup.set(
  "InvalidWormholeFeeCollector",
  () => new InvalidWormholeFeeCollectorError(),
);

/**
 * InvalidWormholeEmitter: 'InvalidWormholeEmitter'
 *
 * @category Errors
 * @category generated
 */
export class InvalidWormholeEmitterError extends Error {
  readonly code: number = 0x1772;
  readonly name: string = "InvalidWormholeEmitter";
  constructor() {
    super("InvalidWormholeEmitter");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidWormholeEmitterError);
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new InvalidWormholeEmitterError());
createErrorFromNameLookup.set(
  "InvalidWormholeEmitter",
  () => new InvalidWormholeEmitterError(),
);

/**
 * InvalidWormholeSequence: 'InvalidWormholeSequence'
 *
 * @category Errors
 * @category generated
 */
export class InvalidWormholeSequenceError extends Error {
  readonly code: number = 0x1773;
  readonly name: string = "InvalidWormholeSequence";
  constructor() {
    super("InvalidWormholeSequence");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidWormholeSequenceError);
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new InvalidWormholeSequenceError());
createErrorFromNameLookup.set(
  "InvalidWormholeSequence",
  () => new InvalidWormholeSequenceError(),
);

/**
 * InvalidSysvar: 'InvalidSysvar'
 *
 * @category Errors
 * @category generated
 */
export class InvalidSysvarError extends Error {
  readonly code: number = 0x1774;
  readonly name: string = "InvalidSysvar";
  constructor() {
    super("InvalidSysvar");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidSysvarError);
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new InvalidSysvarError());
createErrorFromNameLookup.set("InvalidSysvar", () => new InvalidSysvarError());

/**
 * OwnerOnly: 'OwnerOnly'
 *
 * @category Errors
 * @category generated
 */
export class OwnerOnlyError extends Error {
  readonly code: number = 0x1775;
  readonly name: string = "OwnerOnly";
  constructor() {
    super("OwnerOnly");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, OwnerOnlyError);
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new OwnerOnlyError());
createErrorFromNameLookup.set("OwnerOnly", () => new OwnerOnlyError());

/**
 * BumpNotFound: 'BumpNotFound'
 *
 * @category Errors
 * @category generated
 */
export class BumpNotFoundError extends Error {
  readonly code: number = 0x1776;
  readonly name: string = "BumpNotFound";
  constructor() {
    super("BumpNotFound");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, BumpNotFoundError);
    }
  }
}

createErrorFromCodeLookup.set(0x1776, () => new BumpNotFoundError());
createErrorFromNameLookup.set("BumpNotFound", () => new BumpNotFoundError());

/**
 * InvalidForeignContract: 'InvalidForeignContract'
 *
 * @category Errors
 * @category generated
 */
export class InvalidForeignContractError extends Error {
  readonly code: number = 0x1777;
  readonly name: string = "InvalidForeignContract";
  constructor() {
    super("InvalidForeignContract");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidForeignContractError);
    }
  }
}

createErrorFromCodeLookup.set(0x1777, () => new InvalidForeignContractError());
createErrorFromNameLookup.set(
  "InvalidForeignContract",
  () => new InvalidForeignContractError(),
);

/**
 * ZeroBridgeAmount: 'ZeroBridgeAmount'
 *
 * @category Errors
 * @category generated
 */
export class ZeroBridgeAmountError extends Error {
  readonly code: number = 0x1778;
  readonly name: string = "ZeroBridgeAmount";
  constructor() {
    super("ZeroBridgeAmount");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ZeroBridgeAmountError);
    }
  }
}

createErrorFromCodeLookup.set(0x1778, () => new ZeroBridgeAmountError());
createErrorFromNameLookup.set(
  "ZeroBridgeAmount",
  () => new ZeroBridgeAmountError(),
);

/**
 * InvalidTokenBridgeConfig: 'InvalidTokenBridgeConfig'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeConfigError extends Error {
  readonly code: number = 0x1779;
  readonly name: string = "InvalidTokenBridgeConfig";
  constructor() {
    super("InvalidTokenBridgeConfig");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeConfigError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1779,
  () => new InvalidTokenBridgeConfigError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeConfig",
  () => new InvalidTokenBridgeConfigError(),
);

/**
 * InvalidTokenBridgeAuthoritySigner: 'InvalidTokenBridgeAuthoritySigner'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeAuthoritySignerError extends Error {
  readonly code: number = 0x177a;
  readonly name: string = "InvalidTokenBridgeAuthoritySigner";
  constructor() {
    super("InvalidTokenBridgeAuthoritySigner");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeAuthoritySignerError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x177a,
  () => new InvalidTokenBridgeAuthoritySignerError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeAuthoritySigner",
  () => new InvalidTokenBridgeAuthoritySignerError(),
);

/**
 * InvalidTokenBridgeCustodySigner: 'InvalidTokenBridgeCustodySigner'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeCustodySignerError extends Error {
  readonly code: number = 0x177b;
  readonly name: string = "InvalidTokenBridgeCustodySigner";
  constructor() {
    super("InvalidTokenBridgeCustodySigner");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeCustodySignerError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x177b,
  () => new InvalidTokenBridgeCustodySignerError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeCustodySigner",
  () => new InvalidTokenBridgeCustodySignerError(),
);

/**
 * InvalidTokenBridgeEmitter: 'InvalidTokenBridgeEmitter'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeEmitterError extends Error {
  readonly code: number = 0x177c;
  readonly name: string = "InvalidTokenBridgeEmitter";
  constructor() {
    super("InvalidTokenBridgeEmitter");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeEmitterError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x177c,
  () => new InvalidTokenBridgeEmitterError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeEmitter",
  () => new InvalidTokenBridgeEmitterError(),
);

/**
 * InvalidTokenBridgeSequence: 'InvalidTokenBridgeSequence'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeSequenceError extends Error {
  readonly code: number = 0x177d;
  readonly name: string = "InvalidTokenBridgeSequence";
  constructor() {
    super("InvalidTokenBridgeSequence");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeSequenceError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x177d,
  () => new InvalidTokenBridgeSequenceError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeSequence",
  () => new InvalidTokenBridgeSequenceError(),
);

/**
 * InvalidTokenBridgeSender: 'InvalidTokenBridgeSender'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeSenderError extends Error {
  readonly code: number = 0x177e;
  readonly name: string = "InvalidTokenBridgeSender";
  constructor() {
    super("InvalidTokenBridgeSender");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeSenderError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x177e,
  () => new InvalidTokenBridgeSenderError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeSender",
  () => new InvalidTokenBridgeSenderError(),
);

/**
 * InvalidRecipient: 'InvalidRecipient'
 *
 * @category Errors
 * @category generated
 */
export class InvalidRecipientError extends Error {
  readonly code: number = 0x177f;
  readonly name: string = "InvalidRecipient";
  constructor() {
    super("InvalidRecipient");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidRecipientError);
    }
  }
}

createErrorFromCodeLookup.set(0x177f, () => new InvalidRecipientError());
createErrorFromNameLookup.set(
  "InvalidRecipient",
  () => new InvalidRecipientError(),
);

/**
 * InvalidTransferTokenAccount: 'InvalidTransferTokenAccount'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTransferTokenAccountError extends Error {
  readonly code: number = 0x1780;
  readonly name: string = "InvalidTransferTokenAccount";
  constructor() {
    super("InvalidTransferTokenAccount");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTransferTokenAccountError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1780,
  () => new InvalidTransferTokenAccountError(),
);
createErrorFromNameLookup.set(
  "InvalidTransferTokenAccount",
  () => new InvalidTransferTokenAccountError(),
);

/**
 * InvalidTransferToChain: 'InvalidTransferTokenChain'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTransferToChainError extends Error {
  readonly code: number = 0x1781;
  readonly name: string = "InvalidTransferToChain";
  constructor() {
    super("InvalidTransferTokenChain");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTransferToChainError);
    }
  }
}

createErrorFromCodeLookup.set(0x1781, () => new InvalidTransferToChainError());
createErrorFromNameLookup.set(
  "InvalidTransferToChain",
  () => new InvalidTransferToChainError(),
);

/**
 * InvalidTransferTokenChain: 'InvalidTransferTokenChain'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTransferTokenChainError extends Error {
  readonly code: number = 0x1782;
  readonly name: string = "InvalidTransferTokenChain";
  constructor() {
    super("InvalidTransferTokenChain");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTransferTokenChainError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1782,
  () => new InvalidTransferTokenChainError(),
);
createErrorFromNameLookup.set(
  "InvalidTransferTokenChain",
  () => new InvalidTransferTokenChainError(),
);

/**
 * InvalidRelayerFee: 'InvalidRelayerFee'
 *
 * @category Errors
 * @category generated
 */
export class InvalidRelayerFeeError extends Error {
  readonly code: number = 0x1783;
  readonly name: string = "InvalidRelayerFee";
  constructor() {
    super("InvalidRelayerFee");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidRelayerFeeError);
    }
  }
}

createErrorFromCodeLookup.set(0x1783, () => new InvalidRelayerFeeError());
createErrorFromNameLookup.set(
  "InvalidRelayerFee",
  () => new InvalidRelayerFeeError(),
);

/**
 * InvalidPayerAta: 'InvalidPayerAta'
 *
 * @category Errors
 * @category generated
 */
export class InvalidPayerAtaError extends Error {
  readonly code: number = 0x1784;
  readonly name: string = "InvalidPayerAta";
  constructor() {
    super("InvalidPayerAta");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidPayerAtaError);
    }
  }
}

createErrorFromCodeLookup.set(0x1784, () => new InvalidPayerAtaError());
createErrorFromNameLookup.set(
  "InvalidPayerAta",
  () => new InvalidPayerAtaError(),
);

/**
 * InvalidTransferToAddress: 'InvalidTransferToAddress'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTransferToAddressError extends Error {
  readonly code: number = 0x1785;
  readonly name: string = "InvalidTransferToAddress";
  constructor() {
    super("InvalidTransferToAddress");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTransferToAddressError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1785,
  () => new InvalidTransferToAddressError(),
);
createErrorFromNameLookup.set(
  "InvalidTransferToAddress",
  () => new InvalidTransferToAddressError(),
);

/**
 * AlreadyRedeemed: 'AlreadyRedeemed'
 *
 * @category Errors
 * @category generated
 */
export class AlreadyRedeemedError extends Error {
  readonly code: number = 0x1786;
  readonly name: string = "AlreadyRedeemed";
  constructor() {
    super("AlreadyRedeemed");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, AlreadyRedeemedError);
    }
  }
}

createErrorFromCodeLookup.set(0x1786, () => new AlreadyRedeemedError());
createErrorFromNameLookup.set(
  "AlreadyRedeemed",
  () => new AlreadyRedeemedError(),
);

/**
 * InvalidTokenBridgeForeignEndpoint: 'InvalidTokenBridgeForeignEndpoint'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeForeignEndpointError extends Error {
  readonly code: number = 0x1787;
  readonly name: string = "InvalidTokenBridgeForeignEndpoint";
  constructor() {
    super("InvalidTokenBridgeForeignEndpoint");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeForeignEndpointError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1787,
  () => new InvalidTokenBridgeForeignEndpointError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeForeignEndpoint",
  () => new InvalidTokenBridgeForeignEndpointError(),
);

/**
 * NonExistentRelayerAta: 'NonExistentRelayerAta'
 *
 * @category Errors
 * @category generated
 */
export class NonExistentRelayerAtaError extends Error {
  readonly code: number = 0x1788;
  readonly name: string = "NonExistentRelayerAta";
  constructor() {
    super("NonExistentRelayerAta");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, NonExistentRelayerAtaError);
    }
  }
}

createErrorFromCodeLookup.set(0x1788, () => new NonExistentRelayerAtaError());
createErrorFromNameLookup.set(
  "NonExistentRelayerAta",
  () => new NonExistentRelayerAtaError(),
);

/**
 * InvalidTokenBridgeMintAuthority: 'InvalidTokenBridgeMintAuthority'
 *
 * @category Errors
 * @category generated
 */
export class InvalidTokenBridgeMintAuthorityError extends Error {
  readonly code: number = 0x1789;
  readonly name: string = "InvalidTokenBridgeMintAuthority";
  constructor() {
    super("InvalidTokenBridgeMintAuthority");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InvalidTokenBridgeMintAuthorityError);
    }
  }
}

createErrorFromCodeLookup.set(
  0x1789,
  () => new InvalidTokenBridgeMintAuthorityError(),
);
createErrorFromNameLookup.set(
  "InvalidTokenBridgeMintAuthority",
  () => new InvalidTokenBridgeMintAuthorityError(),
);

/**
 * InsufficientBalance: 'InsufficientBalance'
 *
 * @category Errors
 * @category generated
 */
export class InsufficientBalanceError extends Error {
  readonly code: number = 0x178a;
  readonly name: string = "InsufficientBalance";
  constructor() {
    super("InsufficientBalance");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, InsufficientBalanceError);
    }
  }
}

createErrorFromCodeLookup.set(0x178a, () => new InsufficientBalanceError());
createErrorFromNameLookup.set(
  "InsufficientBalance",
  () => new InsufficientBalanceError(),
);

/**
 * TransferFailed: 'TransferFailed'
 *
 * @category Errors
 * @category generated
 */
export class TransferFailedError extends Error {
  readonly code: number = 0x178b;
  readonly name: string = "TransferFailed";
  constructor() {
    super("TransferFailed");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, TransferFailedError);
    }
  }
}

createErrorFromCodeLookup.set(0x178b, () => new TransferFailedError());
createErrorFromNameLookup.set(
  "TransferFailed",
  () => new TransferFailedError(),
);

/**
 * OrderExisted: 'OrderExisted'
 *
 * @category Errors
 * @category generated
 */
export class OrderExistedError extends Error {
  readonly code: number = 0x178c;
  readonly name: string = "OrderExisted";
  constructor() {
    super("OrderExisted");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, OrderExistedError);
    }
  }
}

createErrorFromCodeLookup.set(0x178c, () => new OrderExistedError());
createErrorFromNameLookup.set("OrderExisted", () => new OrderExistedError());

/**
 * OrderUnconfirmed: 'OrderUnconfirmed'
 *
 * @category Errors
 * @category generated
 */
export class OrderUnconfirmedError extends Error {
  readonly code: number = 0x178d;
  readonly name: string = "OrderUnconfirmed";
  constructor() {
    super("OrderUnconfirmed");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, OrderUnconfirmedError);
    }
  }
}

createErrorFromCodeLookup.set(0x178d, () => new OrderUnconfirmedError());
createErrorFromNameLookup.set(
  "OrderUnconfirmed",
  () => new OrderUnconfirmedError(),
);

/**
 * Forbidden: 'Forbidden'
 *
 * @category Errors
 * @category generated
 */
export class ForbiddenError extends Error {
  readonly code: number = 0x178e;
  readonly name: string = "Forbidden";
  constructor() {
    super("Forbidden");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ForbiddenError);
    }
  }
}

createErrorFromCodeLookup.set(0x178e, () => new ForbiddenError());
createErrorFromNameLookup.set("Forbidden", () => new ForbiddenError());

/**
 * LockedVault: 'Vault was locked'
 *
 * @category Errors
 * @category generated
 */
export class LockedVaultError extends Error {
  readonly code: number = 0x178f;
  readonly name: string = "LockedVault";
  constructor() {
    super("Vault was locked");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, LockedVaultError);
    }
  }
}

createErrorFromCodeLookup.set(0x178f, () => new LockedVaultError());
createErrorFromNameLookup.set("LockedVault", () => new LockedVaultError());

/**
 * ProductOverflow: 'Product overflows'
 *
 * @category Errors
 * @category generated
 */
export class ProductOverflowError extends Error {
  readonly code: number = 0x1790;
  readonly name: string = "ProductOverflow";
  constructor() {
    super("Product overflows");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, ProductOverflowError);
    }
  }
}

createErrorFromCodeLookup.set(0x1790, () => new ProductOverflowError());
createErrorFromNameLookup.set(
  "ProductOverflow",
  () => new ProductOverflowError(),
);

/**
 * FeeOverflow: 'Fee overflows'
 *
 * @category Errors
 * @category generated
 */
export class FeeOverflowError extends Error {
  readonly code: number = 0x1791;
  readonly name: string = "FeeOverflow";
  constructor() {
    super("Fee overflows");
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, FeeOverflowError);
    }
  }
}

createErrorFromCodeLookup.set(0x1791, () => new FeeOverflowError());
createErrorFromNameLookup.set("FeeOverflow", () => new FeeOverflowError());

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export function errorFromCode(code: number): MaybeErrorWithCode {
  const createError = createErrorFromCodeLookup.get(code);
  return createError != null ? createError() : null;
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export function errorFromName(name: string): MaybeErrorWithCode {
  const createError = createErrorFromNameLookup.get(name);
  return createError != null ? createError() : null;
}
