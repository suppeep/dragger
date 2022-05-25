/* eslint-disable @typescript-eslint/no-this-alias */
import gsap from 'gsap'
// import TweenLite from 'gsap/TweenLite'
import Draggable from 'gsap/Draggable'
import 'gsap/CSSPlugin'

// gsap.registerPlugin(TweenLite)
gsap.registerPlugin(Draggable)

class Grid {
  _rows: any
  _cols: any
  _parent: any
  _container: HTMLDivElement
  constructor(settings: any) {
    this._rows = settings.rows
    this._cols = settings.cols
    this._parent = document.querySelector(settings.parent)
    this._container = document.createElement('div')

    const frag = document.createDocumentFragment()
    frag.appendChild(
      this._container,
    ).className = settings.container.className || ''

    const tr = document.createDocumentFragment()
    tr.appendChild(
      document.createElement('div'),
    ).className = settings.row.className

    for (let j = 0; j < this._cols + 1; j++) {
      tr.firstChild.appendChild(
        document.createElement('div'),
      ).className = settings.cell.className || ''
    }

    for (let i = 0; i < this._rows + 1; i++) {
      frag.firstChild.appendChild(
        tr.cloneNode(true),
      )
    }
    this._parent.appendChild(frag)
  }
}

class DraggableItemPanel {
  _parent: any
  _scalar: any
  _itemWrapper: any
  _itemClass: any
  _itemDragClass: any
  _onGridClass: any
  _dropZone: any
  _draggables: any[]
  constructor(settings) {
    this._parent = document.querySelector(settings.parent)
    this._scalar = settings.scalar
    this._itemWrapper = settings.item.wrapper
    this._itemClass = settings.item.className
    this._itemDragClass = settings.item.dragClass
    this._onGridClass = settings.onGridClass
    this._dropZone = settings.dropZone
    this._draggables = []
  }

  createPlaceholders(data) {
    const nodes = document.createDocumentFragment()
    data.forEach(function (item) {
      const curr = document.createElement('div') as any
      curr.className = this._itemWrapper
      curr.appendChild(
        document.createElement('div'),
      ).className = this._itemClass
      curr.firstChild.style.width = `${item.width * this._scalar}px`
      curr.firstChild.style.height = curr.firstChild.style.lineHeight = curr.style.height = `${item.height * this._scalar}px`
      curr.firstChild.innerHTML = item.name
      nodes.appendChild(curr)
    }, this)

    nodes.childNodes.forEach(function (placeholder) {
      const dragEl = placeholder.firstChild.cloneNode(true) as any
      dragEl.classList.add(this._itemDragClass)
      placeholder.appendChild(dragEl)
    }, this)
    this._parent.appendChild(nodes)

    this._makeDraggables()
  }

  _addToGrid(el) {
    const ci = this

    ci._dropZone.prepend(el)

    Draggable.create(el, {
      bounds: ci._dropZone,
      autoScroll: 1,
      type: 'x,y',
      liveSnap: true,
      snap: {
        x(prev) {
          return Math.round(prev / ci._scalar) * ci._scalar
        },
        y(prev) {
          return Math.round(prev / ci._scalar) * ci._scalar
        },
      },
      onPress() {
        this.prevX = this.x
        this.prevY = this.y
      },
      onDragEnd() {
        let hasCollision = false
        const itemsOnGrid = document.getElementsByClassName(ci._onGridClass)

        for (const item of Object.entries(itemsOnGrid)) {
          if (this.hitTest(item, ci._scalar / 2))
            hasCollision = true
        }

        if (hasCollision) {
          TweenLite.to(this.target, 0.1, {
            x: this.prevX,
            y: this.prevY,
          })
        }
      },
    })
  }

  _makeDraggables() {
    const ci = this
    const _items = document.getElementsByClassName(this._itemDragClass)

    this._draggables = Draggable.create(_items, {
      onPress() {
        const targ = this.target
        this.offset = {
          top: ci._dropZone.offsetTop - targ.offsetTop,
          left: ci._dropZone.offsetLeft - targ.offsetLeft,
        }
      },
      onDragStart() {
        this.target.style.opacity = 1.0
      },
      onDragEnd() {
        let hasCollision = false
        const itemsOnGrid = document.getElementsByClassName(ci._onGridClass)

        for (const item of Object.entries(itemsOnGrid)) {
          if (this.hitTest(item, ci._scalar / 2))
            hasCollision = true
        }

        if (!hasCollision) {
          const clone = document.createElement('div')
          clone.className = ci._onGridClass
          clone.style.width = this.target.style.width
          clone.style.height = this.target.style.height
          clone.style.lineHeight = this.target.style.height
          clone.style.left = `${Math.round((this.x - this.offset.left) / ci._scalar) * ci._scalar}px`
          clone.style.top = `${Math.round((this.y - this.offset.top) / ci._scalar) * ci._scalar}px`
          clone.innerText = this.target.textContent

          ci._addToGrid(clone)

          this.target.style.opacity = 0
        }

        TweenLite.to(this.target, 0.1, {
          x: 0,
          y: 0,
          onComplete() {
            this.target.style.opacity = 0
          },
        })
      },
    })
  }
}

class DraggableManager {
  _grid: Grid
  _itemPanel: DraggableItemPanel
  constructor(settings) {
    this._grid = new Grid(settings.grid)
    settings.itemPanel.dropZone = this._grid._container
    settings.itemPanel.scalar = settings.grid.cell.size

    this._itemPanel = new DraggableItemPanel(settings.itemPanel)
  }

  populateItemPanel(data) {
    this._itemPanel.createPlaceholders(data)
  }
}

export { DraggableManager }

