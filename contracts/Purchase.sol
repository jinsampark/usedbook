pragma solidity ^0.5.8;

contract Purchase {

    address[16] public buyers;


    function buy(uint bookid) public returns (uint) {
        require(bookid >= 0 && bookid <= 15);

        buyers[bookid] = msg.sender;

        return bookid;
    }

    function getBuyers() public view returns (address[16] memory) {
        return buyers;
    }

}