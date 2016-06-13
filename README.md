# koa2-react-renderer

## Useage
```javascript
import path from 'path'
import Renderer from './index'

const renderer = new Renderer({
    cache: true,
    clear: false,
    stream: false,
    views: path.join(__dirname, 'views')
})
app.use(renderer())

//router

router.get('/', async (ctx, next) => {
    await ctx.render('Front', {title: '11', content: '222'})
})
```


