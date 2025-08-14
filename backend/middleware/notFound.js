export function notFound(req, res){
    res.status(404).render('404', {
        title: '404 Page',
        error: 'Page cannot be found'
    })

   /*  res.status(404).json({
        title: '404 page',
        error: 'Page cannot be found',
    }) */
}