class LeactDom {
    static isFirst = true

    static render(vDom, parent = null) {
        // console.log('render', vDom, [parent])
        /*
        如果 vDom 是空的
        就啥都不干
        直接返回
         */
        if (null === vDom) {
            return
        }
        /*
        如果 vDom 是字符串和数字
        就创建文本节点
        因为是字符串和数字
        不可能会有子节点
        如果传入了父元素
        就直接挂在到父元素上
         */
        if (['string', 'number'].includes(typeof vDom)) {
            let element = document.createTextNode(vDom)
            element.$$vDom = vDom
            parent && parent.appendChild(element)
            return element
        }
        /*
        如果 vDom 对象, vDom.type 是字符串
        说明是 html 标签
        就创建节点
        并渲染属性到节点
        同时渲染子元素
        如果传入了父元素
        就直接挂在到父元素上
         */
        if (typeof vDom === 'object' && typeof vDom.type === 'string') {

            let element = document.createElement(vDom.type)
            element.$$vDom = vDom

            this.mapPropsToAttribute(vDom.props, element)
            vDom.children.forEach((child) => {
                this.render(child, element)
            })
            parent && parent.appendChild(element)
            return element
        }
        /*
        如果 vDom 是对象, 并且 vDom.type 是函数
        说明是组件
        就调用组件的 render 方法
        和相关的声明周期
         */
        if (typeof vDom === 'object' && typeof vDom.type === 'function') {
            // 组件的 construct 调用
            let component = new vDom.type(vDom.props)
            component.componentWillMount()
            let compVDom = component.render()
            let element = this.render(compVDom, parent)
            component.$$element = element
            component.componentDidMount()
            component.$$element.$$component = component
            component.$$element.$$vDom = compVDom
            return element
        }

        throw `could not find this type of vDom: ${vDom}`
    }

    static patch(dom, vDom, parent = dom.parentNode) {
        console.log('patch', [dom], vDom, [parent])


        // 都是字符串, 改变内容就好了
        if (dom.nodeType === 3 && typeof vDom === 'string' && dom !== vDom) {
            console.log(1)
            dom.textContent = vDom
            return
        }
        // 原本是字符串, 但是新的不是字符串
        if (dom.nodeType === 3 && typeof vDom === 'object' && typeof vDom.type === 'string') {
            console.log(2)

            parent.replaceChild(this.render(vDom), dom)

            return
        }
        // 原本是对象, 新的也是对象, 并且是 html 元素
        if (dom.nodeType === 1 && typeof vDom === 'object' && typeof vDom.type === 'string') {

            // 如果两个类型不相同
            if (dom.nodeName.toLowerCase() !== vDom.type) {
                let element = this.render(vDom)
                vDom.$$element = element
                parent.replaceChild(element, dom)
                return
            }

            let len = Math.max(dom.children.length, vDom.children.length)
            for (let i = 0; i < len; i++) {
                console.log(3)

                let component = dom.childNodes[i].$$component
                let nextProps = vDom.children[i].props
                this.patch(dom.childNodes[i], vDom.children[i], dom)

                // if (component && component.shouldComponentUpdate && component.shouldComponentUpdate(nextProps, component.state)) {
                // }
            }
            return
        }
        if (dom.nodeType === 1 && typeof vDom === 'object' && typeof vDom.type === 'function') {
            console.log('patch3', [dom], vDom, [parent])

            let component = dom.$$component
            // if (!component.shouldComponentUpdate(vDom.props, component.state)) return
            // component.componentWillUpdate()
            component.props = vDom.props
            component.componentWillReceiveProps(vDom.props, component.state)
            // component.$$element = element
            // component.componentDidUpdate()
        }

    }

    static mapPropsToAttribute(props, element) {
        Object.keys(props).forEach((key) => {
            let newKey = key
            if (key === 'onChange') {
                newKey = 'oninput'
                element[newKey.toLowerCase()] = props[key]
            } else if (key === 'style') {
                let style = props[key]
                Object.keys(style).forEach(s => {
                    element.style[s] = style[s]
                })
            } else if (key === 'className') {
                element.className = props[key]
            }

        })
    }
}

export default LeactDom