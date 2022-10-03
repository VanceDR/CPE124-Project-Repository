var express = require('express'),
  router = express.Router(),
  path = require('path')

homepage = path.resolve(__dirname, './../public/test.html')
styles = path.resolve(__dirname, './../public/app-css.css')


router.get('/', (req, res, next)=>{
    res.status(200).sendFile(homepage)
    
})

router.get('/test.html', (req, res, next)=>{
    res.status(200).sendFile(homepage)
    
})

router.get('/app-css.css', (req,res,next)=>{
    res.status(200).sendFile(styles)
})

router.all('*', (req,res,next)=>{
    res.status(404).send('<h1>Page not Found!</h1>')
})

module.exports = router