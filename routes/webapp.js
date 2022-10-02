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

router.get('/:id', (req, res)=>{
    const {id} = req.params
    console.log(req.params)
    if (Number(id) === 1){
        res.status(200).sendFile(graph_one)
    } else if (Number(id) === 2) {
        res.status(200).sendFile(graph_two)
    } else {
        res.status(404).send('Page not Found')
    }
})

module.exports = router