// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvoiceEscrow is Ownable {
    using SafeERC20 for IERC20;

    enum EscrowStatus { None, Created, Funded, Released, Disputed, Cancelled }

    struct Invoice {
        bytes32 invoiceHash;
        address issuer;
        address payer;
        uint256 amount;
        address token;
        uint256 createdAt;
        EscrowStatus status;
    }

    mapping(uint256 => Invoice) public invoices;
    uint256 public nextInvoiceId;

    event InvoiceAnchored(uint256 indexed invoiceId, bytes32 invoiceHash, address indexed issuer, address indexed payer, uint256 amount, address token);
    event Deposited(uint256 indexed invoiceId, address indexed from, uint256 amount, address token);
    event Released(uint256 indexed invoiceId, address indexed to, uint256 amount, address token);
    event Disputed(uint256 indexed invoiceId, address indexed by, string reason);
    event Resolved(uint256 indexed invoiceId, address indexed resolver, EscrowStatus status);
    event Cancelled(uint256 indexed invoiceId);

    modifier invoiceExists(uint256 invoiceId) {
        require(invoiceId < nextInvoiceId, "Invoice does not exist");
        _;
    }

    constructor() {
        nextInvoiceId = 0;
    }

    function anchorInvoice(
        bytes32 invoiceHash,
        address payer,
        uint256 amount,
        address token
    ) external returns (uint256) {
        uint256 id = nextInvoiceId++;
        invoices[id] = Invoice({
            invoiceHash: invoiceHash,
            issuer: msg.sender,
            payer: payer,
            amount: amount,
            token: token,
            createdAt: block.timestamp,
            status: EscrowStatus.Created
        });

        emit InvoiceAnchored(id, invoiceHash, msg.sender, payer, amount, token);
        return id;
    }

    function deposit(uint256 invoiceId) external payable invoiceExists(invoiceId) {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == EscrowStatus.Created || inv.status == EscrowStatus.Funded, "Not fundable");
        if (inv.token == address(0)) {
            require(msg.value > 0, "No native funds sent");
            inv.status = EscrowStatus.Funded;
            emit Deposited(invoiceId, msg.sender, msg.value, address(0));
        } else {
            require(msg.value == 0, "Do not send native for ERC20 deposit");
            uint256 beforeBal = IERC20(inv.token).balanceOf(address(this));
            IERC20(inv.token).safeTransferFrom(msg.sender, address(this), inv.amount);
            uint256 afterBal = IERC20(inv.token).balanceOf(address(this));
            require(afterBal - beforeBal >= inv.amount, "ERC20 transfer failed");
            inv.status = EscrowStatus.Funded;
            emit Deposited(invoiceId, msg.sender, inv.amount, inv.token);
        }
    }

    function release(uint256 invoiceId) external invoiceExists(invoiceId) {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == EscrowStatus.Funded, "Not funded");
        require(msg.sender == inv.payer || msg.sender == owner() || msg.sender == inv.issuer, "Unauthorized to release");

        inv.status = EscrowStatus.Released;
        if (inv.token == address(0)) {
            uint256 amt = inv.amount;
            (bool ok, ) = payable(inv.issuer).call{value: amt}("");
            require(ok, "Native transfer failed");
            emit Released(invoiceId, inv.issuer, amt, address(0));
        } else {
            uint256 amt = inv.amount;
            IERC20(inv.token).safeTransfer(inv.issuer, amt);
            emit Released(invoiceId, inv.issuer, amt, inv.token);
        }
    }

    function raiseDispute(uint256 invoiceId, string calldata reason) external invoiceExists(invoiceId) {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == EscrowStatus.Funded || inv.status == EscrowStatus.Created, "Cannot dispute now");
        require(msg.sender == inv.payer || msg.sender == inv.issuer || msg.sender == owner(), "Not authorized");
        inv.status = EscrowStatus.Disputed;
        emit Disputed(invoiceId, msg.sender, reason);
    }

    function resolveDispute(uint256 invoiceId, uint8 resolveTo) external invoiceExists(invoiceId) onlyOwner {
        Invoice storage inv = invoices[invoiceId];
        require(inv.status == EscrowStatus.Disputed, "Not disputed");
        require(resolveTo == 0 || resolveTo == 1, "Invalid resolution");

        if (resolveTo == 1) {
            inv.status = EscrowStatus.Released;
            if (inv.token == address(0)) {
                uint256 amt = inv.amount;
                (bool ok, ) = payable(inv.issuer).call{value: amt}("");
                require(ok, "Native transfer failed");
                emit Resolved(invoiceId, msg.sender, inv.status);
                emit Released(invoiceId, inv.issuer, amt, address(0));
            } else {
                uint256 amt = inv.amount;
                IERC20(inv.token).safeTransfer(inv.issuer, amt);
                emit Resolved(invoiceId, msg.sender, inv.status);
                emit Released(invoiceId, inv.issuer, amt, inv.token);
            }
        } else {
            inv.status = EscrowStatus.Cancelled;
            if (inv.token == address(0)) {
                uint256 amt = inv.amount;
                (bool ok, ) = payable(inv.payer).call{value: amt}("");
                require(ok, "Refund failed");
                emit Resolved(invoiceId, msg.sender, inv.status);
            } else {
                uint256 amt = inv.amount;
                IERC20(inv.token).safeTransfer(inv.payer, amt);
                emit Resolved(invoiceId, msg.sender, inv.status);
            }
        }
    }

    function getInvoice(uint256 invoiceId) external view invoiceExists(invoiceId) returns (
        bytes32 invoiceHash,
        address issuer,
        address payer,
        uint256 amount,
        address token,
        uint256 createdAt,
        EscrowStatus status
    ) {
        Invoice storage inv = invoices[invoiceId];
        return (inv.invoiceHash, inv.issuer, inv.payer, inv.amount, inv.token, inv.createdAt, inv.status);
    }

    receive() external payable {}
    fallback() external payable {}
}
