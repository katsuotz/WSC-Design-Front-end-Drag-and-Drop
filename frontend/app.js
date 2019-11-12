const router = select('.route-editor');
const modal = select('.modal.view-editor');
const presentation = select('.presentation-view');
const main = new Main();
let action, selectedLink, selectedElement, mode = 'design', isAnimating = false;

(function () {
  //  create new route editor
  main.init()
  let actionOverlay = select(`.action-overlay`)

  // on mouse down event
  document.addEventListener('mousedown', function (e) {
    let el = e.target

    let shift = e.shiftKey

    // un select link
    if (selectedLink) {
      replaceClass(selectedLink, / selected/g)
    }

    //  on click area
    if (hasClass(el, 'area')) {
      let parent = el.parentElement
      let child = el

      if (!shift) {
        el = parent
        parent.className += ' drag'
      } else {
        parent.className += ' z-index-0'
      }

      router.onmousemove = mouseMove
      router.onmouseup = mouseUp

      let x1, x2, y1, y2

      x2 = e.clientX
      y2 = e.clientY

      function mouseMove(e) {
        action = shift ? 'drag-area' : 'drag-element'

        e = e || window.event
        e.preventDefault()

        x1 = e.clientX - x2
        y1 = e.clientY - y2

        x2 = e.clientX
        y2 = e.clientY

        el.style.left = x1 + el.offsetLeft + 'px'
        el.style.top = y1 + el.offsetTop + 'px'

        if (action == 'drag-element') {
          main.updatePosition(el.id, el.style.left, el.style.top)
          updateActionPosition()
        }
      }

      function mouseUp(e) {
        let dropArea = e.target

        router.onmousemove = null
        router.onmouseup = null

        replaceClass(parent, / z-index-0/g)
        replaceClass(parent, / drag/g)

        if (action == 'drag-area') {
          el.style.left = 0
          el.style.top = 0
        }

        if (!action && !hasClass(child, 'connected')) {
          // create new link
          let area = parseInt(child.getAttribute('data-area'))

          let x = parent.offsetLeft
          let y = parent.offsetTop

          switch (area) {
            case 1:
              y -= 150
              break
            case 2:
              x += 150
              break
            case 3:
              y += 150
              break
            case 4:
              x -= 150
              break
          }

          x += 'px'
          y += 'px'

          main.newElement(x, y, parent.id, area)
        } else if (action == 'drag-area' && hasClass(dropArea, 'area')) {
          // drag area to another element to make a new link
          if (!hasClass(child, 'connected') && !hasClass(dropArea, 'connected')) {
            main.newLink(parent.id, parseInt(child.getAttribute('data-area')), dropArea.parentElement.id, parseInt(dropArea.getAttribute('data-area')))
          }
        }

        action = null
      }
    }
    //  on click link
    else if (hasClass(el, 'link')) {
      selectedLink = el
      el.className += ' selected'
    }
    //  on click delete button
    else if (hasClass(el, 'btn-delete')) {
      main.deleteElement(selectedElement)
      replaceClass(actionOverlay, / show/g)
    }
    //  on click edit button
    else if (hasClass(el, 'btn-edit')) {
      showEditorModal()
      replaceClass(actionOverlay, / show/g)
    }
    //  on click close modal
    else if (hasClass(el, 'modal-close')) {
      removeEditor()
    }
    //  on click change mode
    else if (hasClass(el, 'btn-change-mode')) {
      changeMode()
    }
    //  on click change mode
    else if (hasClass(el, 'btn-change-slide')) {
      if (isAnimating === false) {
        let link = el.getAttribute('data-link')

        link = main.links[link]

        let activeSlide = select(`.presentation-item.active`)

        let slideId = link.fromId == activeSlide.getAttribute('data-slide') ? link.toId : link.fromId

        let slide = main.elements[slideId]

        changeSlide(slide, parseInt(el.getAttribute('data-area')))
      }
    }
  })

  // on mouse over event
  document.addEventListener('mouseover', function (e) {
    let el = e.target

    // show hide action overlay
    if (hasClass(el, 'area')) {
      selectedElement = el.parentElement
      actionOverlay.className += ' show'
      updateActionPosition()
    } else if (hasClass(el, 'route-editor') && action == null) {
      replaceClass(actionOverlay, / show/g)
      selectedElement = null
    }
  })

  // update action overlay position
  function updateActionPosition() {
    actionOverlay.style.left = selectedElement.offsetLeft + selectedElement.offsetWidth / 4 + 'px'
    actionOverlay.style.top = selectedElement.offsetTop + selectedElement.offsetHeight / 4 + 'px'
  }

  // on keydown event
  document.addEventListener('keydown', function (e) {
    if (selectedLink && (e.key == 'Delete' || e.key == 'Backspace')) {
      main.deleteLink(selectedLink)
      selectedLink = null
    }
  })


  //  ckeditor wysiwyg
  var editor;

  function removeEditor() {
    replaceClass(modal, / show/g)

    if (!editor)
      return;

    // Destroy the editor.
    editor.destroy();
    editor = null;
  }

  //  show editor modal
  function showEditorModal() {
    modal.className += ' show'

    if (editor)
      return;

    let element = main.elements[selectedElement.id]

    let title = element.title || ''
    let content = element.content || ''
    let relations = element.relations || []

    let inputTitle = selectId('inputTitle')
    //  change title
    inputTitle.value = title
    var config = {};
    // create editor
    editor = CKEDITOR.appendTo('editor', config, content);

    //  update title
    inputTitle.onkeyup = function () {
      main.updateTitle(selectedElement.id, this.value)
    }

    //  update content
    editor.on('change', function () {
      main.updateContent(selectedElement.id, editor.getData())
    })

    let areas = selectAll(`#${element.id} > .area.connected`)

    select('.relation-editor').innerHTML = ''

    for (let i = 0; i < areas.length; i++) {
      let area = areas[i]

      let areaN = parseInt(area.getAttribute('data-area'))

      let div = document.createElement('div')
      div.className = 'col form-group'
      div.innerHTML = `<label>Relation ${areaN}</label>
            <input type="text" class="form-control" id="inputArea${areaN}" data-area="${areaN}" value="${relations[areaN] || ''}">`

      //  append relation
      select('.relation-editor').appendChild(div)

      //  update relation
      select(`#inputArea${area.getAttribute('data-area')}`).onkeyup = function () {
        main.updateRelation(selectedElement.id, parseInt(this.getAttribute('data-area')), this.value)
      }
    }
  }

  // changing mode (presentation <=> design)
  function changeMode() {
    mode = mode == 'design' ? 'presentation' : 'design'

    select(`.btn-change-mode`).innerHTML = (mode == 'design' ? 'Presentation' : 'Design') + ' Mode'

    if (mode == 'presentation') {
      let elements = main.elements

      presentation.innerHTML = ''

      for (let k in elements) {
        let element = elements[k]

        let div = document.createElement('div');
        div.className = 'presentation-item'
        div.setAttribute('data-slide', element.id)
        let s = `
                  <h1 class="title">${element.title || 'Untitled'}</h1>
                  <div class="content my-2">
                    ${element.content || 'The content is still empty'}
                  </div><div class="row relation-view">
`

        let areas = selectAll(`#${element.id} > .area.connected`)

        for (let i = 0; i < areas.length; i++) {
          let area = areas[i]
          let areaN = parseInt(area.getAttribute('data-area'))
          s += `
                    <div class="col">
                      <button class="btn btn-outline-primary w-100 btn-change-slide" data-area="${areaN}" data-link="${area.getAttribute('data-link')}">Go to ${areaN} - ${element.relations[areaN] || 'untitled'}</button>
                    </div>
                  `
        }

        s += '</div>'

        div.innerHTML = s

        presentation.appendChild(div)
      }

      let mainElement = elements[main.mainElement]

      changeSlide(mainElement)

      router.className += ` d-none`
      replaceClass(presentation, / d-none/g)
    } else {
      presentation.className += ` d-none`
      replaceClass(router, / d-none/g)
    }
  }

  function changeSlide(slide, area = null) {
    let activeSlide = select(`.presentation-item.active`)
    let slideEl = select(`.presentation-item[data-slide="${slide.id}"]`)

    slideEl.className += ' active'

    isAnimating = true

    if (activeSlide) {
      replaceClass(activeSlide, / active/g)
      switch (area) {
        case 1:
          activeSlide.className += ' leaving slide-out-down'
          slideEl.className += ' slide-in-down'
          break
        case 3:
          activeSlide.className += ' leaving slide-out-up'
          slideEl.className += ' slide-in-up'
          break
        case 2:
          activeSlide.className += ' leaving slide-out-left'
          slideEl.className += ' slide-in-right'
          break
        case 4:
          activeSlide.className += ' leaving slide-out-right'
          slideEl.className += ' slide-in-left'
          break
      }

      setTimeout(() => {
        replaceClass(activeSlide, / leaving/g)
        replaceClass(activeSlide, / slide-out(.*)/g)
        replaceClass(slideEl, / slide-in(.*)/g)
      }, 580)
    } else {
      slideEl.className += ' slide-in-down'
    }

    setTimeout(() => {
      replaceClass(slideEl, / slide-in(.*)/g)
      slideEl.className += ' active'
      isAnimating = false
    }, 580)
  }

})();