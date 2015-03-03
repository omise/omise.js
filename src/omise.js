(function(window, undefined) {
  "use strict";

  var Omise = {};

  // private

  Omise._config = {};
  Omise._config.vaultUrl = "https://vault.omise.co";
  Omise._config.assetUrl = "https://cdn.omise.co";

  Omise._rpc = false;
  Omise.easyXDM = easyXDM.noConflict('Omise');
  Omise.easyXDM.DomHelper.requiresJSON(Omise._config.assetUrl + "/json2.js");

  Omise._createRpc = function(){
    if (Omise._rpc) {
      return Omise._rpc;
    } else {
      Omise._rpc = new Omise.easyXDM.Rpc({
        remote: Omise._config.vaultUrl + "/provider",
        swf: Omise._config.assetUrl + "/easyxdm.swf"
      }, {remote: {createToken: {}}});
      return Omise._rpc;
    }
  };

  // public

  Omise.setPublicKey = function(publicKey) {
    Omise.publicKey = publicKey;
    return Omise.publicKey;
  };

  Omise.createToken = function(as, attributes, handler) {
    var data = {};
    data[as] = attributes;
    Omise._createRpc().createToken(Omise.publicKey, data, function(response) {
      handler(response.status, response.data);
    }, function(){ /* noop */ });
  };

  // exports

  window.Omise = Omise;

})(window);
