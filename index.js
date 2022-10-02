var httpServer = require('./servers/http'),
 resources = require('./resources/model'),
 websocket = require('./servers/websocket')

// var pirPlugin = require('./plugins/internal/pirPlugin') //#A
// pirPlugin.start({'simulate': true, 'frequency': 2000}); //#B


var server = httpServer.listen(resources.pi.port, function () {
    console.log('HTTP server started...');
  
    websocket.listen(server)

  
    console.info('Your WoT Pi is up and running on port %s', resources.pi.port);
  });