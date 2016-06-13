"use strict"

require('babel-core/register')({
    presets: ['es2015-node5', 'react', 'stage-3', 'stage-0']
})

require('babel-polyfill')

import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import ReactDOMStream from "react-dom-stream/server"

const defaultCfg = {
    stream: false,
    cache: true,
    clear: false,
    views: path.join(__dirname, 'views')
}

export default class {
    constructor(config = defaultCfg) {
        this.config = config
        console.log(config)
        const renderer = config.stream ? ReactDOMStream: ReactDOMServer
        this.renderString = config.clear? renderer.renderToStaticMarkup: renderer.renderToString
        this.cache = {}
    }

    getComponent(tplPath, props) {
        const module = this.cache[tplPath] || require(tplPath).default
        if (this.config.cache) {
            this.cache[tplPath] = module
        }
        return React.createElement(module, props)
    }

    render(tpl, props) {
        return new Promise((resolve, reject) => {
            try {
                const viewPath = this.config.viewPath
                const tplPath = path.join(viewPath, tpl)
                console.log(tplPath)
                const body = this.renderString(this.getComponent(tplPath, props))
                resolve(body)
            } catch (err) {
                reject(err)
            }
        })
    }

    renderer() {
        return async (ctx, next) => {
            ctx.render = async (path, locals={}) => {
                locals.ctx = ctx
                const body = await this.render(path, locals)
                if (this.config.stream) {
                    body.pipe(ctx.res, {end: false}).on('end', ctx.res.end)
                } else {
                    ctx.body = body
                }
            }
            await next()
        }
    }
}