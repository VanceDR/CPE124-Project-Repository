var express = require('express'),
  router = express.Router(),
  path = require('path')

homepage = path.resolve(__dirname, './../public/test.html')
graph_one = path.resolve(__dirname, './../public/graph-one.html')
graph_two = path.resolve(__dirname, './../public/graph-two.html')
styles = path.resolve(__dirname, './../public/app-css.css')


router.get('/', (req, res, next)=>{
    res.status(200).sendFile(homepage)
    
})

router.get('/test.html', (req, res, next)=>{
    res.status(200).sendFile(homepage)
    
})

router.get('/graph-one.html', (req, res, next)=>{
    res.status(200).sendFile(graph_one)
    
})

router.get('/graph-two.html', (req, res, next)=>{
    res.status(200).sendFile(graph_two)
    
})

router.get('/app-css.css', (req,res,next)=>{
    res.status(200).sendFile(styles)
})

router.all('*', (req,res,next)=>{
    res.status(404).send('<h1>Page not Found!</h1>')
})

module.exports = router