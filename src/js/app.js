App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load books.
    $.getJSON('../books.json', function(data) {
      var booksRow = $('#booksRow');
      var bookTemplate = $('#bookTemplate');

      for (i = 0; i < data.length; i ++) {
        bookTemplate.find('.panel-title').text(data[i].name);
        bookTemplate.find('img').attr('src', data[i].picture);
        bookTemplate.find('.book-author').text(data[i].author);
        bookTemplate.find('.book-year').text(data[i].year);
        bookTemplate.find('.book-publisher').text(data[i].publisher);
        bookTemplate.find('.btn-buy').attr('data-id', data[i].id);

        booksRow.append(bookTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Purchase.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PurchaseArtifact = data;
      App.contracts.Purchase = TruffleContract(PurchaseArtifact);
    
      // Set the provider for our contract
      App.contracts.Purchase.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the buyed books
      return App.markBuyed();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-buy', App.handleBuy);
  },

  markBuyed: function(buyers, account) {
    var PurchaseInstance;

    App.contracts.Purchase.deployed().then(function(instance) {
      PurchaseInstance = instance;
    
      return PurchaseInstance.getBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-book').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleBuy: function(event) {
    event.preventDefault();

    var bookId = parseInt($(event.target).data('id'));

    var PurchaseInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
    
      var account = accounts[0];
    
      App.contracts.Purchase.deployed().then(function(instance) {
        PurchaseInstance = instance;
    
        // Execute buy as a transaction by sending account
        return PurchaseInstance.buy(bookId, {from: account});
      }).then(function(result) {
        return App.markBuyed();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
