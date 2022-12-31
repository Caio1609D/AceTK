class AceClass {
    constructor () {
        this.body = document.querySelector("body");
        this.sizesList = {"sizes": [], "id": []};
        this.color = "black";
        this.seccolor = "white";
        this.newstyle = document.createElement("style");
        document.querySelector("head").appendChild(this.newstyle)
        this.sheet = this.newstyle.sheet;
        this.skippers = [];
        this.wcag = {
            "1.1.1": 
            {
                "text": "Looks like we have an image without text alternative. Please, consider using alt HTML attribute or another form of alternative text content", 
                "exceptions": ["It serves purpose of Input", "Time Based Media (Video)", "It is a Test", "Is intended to create sensory experience", "It is a CAPTCHA", "It is purely decorative", "Another"],
                "query": "image",
                "func": this.checkImg
            },
            "1.4.2": 
            {
                "text": "Looks like a audio runs automatically for more than 3 seconds. Consider adding a way to control the volume or stopping the audio from playing",
                "exceptions": ["It already have one", "Another"],
                "query": "audio, video",
                "func": this.checkAudio
            },
            "2.5.3": 
            {
                "text": "Looks like we have a form element which name not correspond to it's label or text. Please consider changing it's name Attribute",
                "exceptions": ["It's a essential feature"],
                "query": "select, button, input",
                "func": this.checknames
            },
            "3.3.2":
            {
                "text": "Looks like we have a form element without proper labeling. Please consider adding it a innerText or proper label tag",
                "exceptions": ["It already have a text explaining it", "Another"],
                "query": "select, button, input",
                "func": this.checklabels
            }
        };
        this.panel_vals = {}
    }

    setColor(c, s) {
        if (c) this.color = c;
        if (s) this.seccolor = s;
    }

    addRule(selector, css) {
        var propText = typeof css === "string" ? css : Object.keys(css).map(function (p) {
            return p + ":" + (p === "content" ? "'" + css[p] + "'" : css[p]);
        }).join(";");
        this.sheet.insertRule(selector + "{" + propText + "}", this.sheet.cssRules.length);
    }

    insertBefore(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode)
    }
    
    insertAfter(newNode, referenceNode) {
        this.insertBefore(newNode, referenceNode.nextSibling)
    }
    
    createPop(text, element, exceptions) {
        let container = document.createElement("div")
        container.setAttribute("className", "AceTKPopup")
        let p = document.createElement("p")
        p.setAttribute("className", "AceTKPoptext")
        p.innerText = text
        let except = document.createElement("button")
        except.setAttribute("className", "AceTKPopexcept")
        let exceptlist = document.createElement("div")
        exceptlist.setAttribute("className", "AceTKPoplist")
        container.appendChild(p)
        container.appendChild(except)
        container.appendChild(exceptlist)
    
        container.style.setProperty("position", "absolute")
        container.style.setProperty("background-color", this.color)
        container.style.setProperty("font-color", this.seccolor)
        container.style.setProperty("border", "solid 1px")
        container.style.setProperty("border-color", this.seccolor)
    
        except.innerText = "Exceptions"
        exceptlist.style.setProperty("position", "absolute")
    
        for (let i = 0; i < exceptions.length; i++) {
            let exception = document.createElement("button")
            exception.innerText = exceptions[i]
            exception.addEventListener("click", () => {
                container.remove()
            })
            exceptlist.appendChild(exception)
        }
    
        exceptlist.style.setProperty("width", "min-content")
        exceptlist.style.setProperty("display", "none")
        except.addEventListener("click", () => {
            if (exceptlist.style.getPropertyValue("display") != "none") {
                exceptlist.style.setProperty("display", "none")
            } else {
                exceptlist.style.setProperty("display", "block")
            }
        })
    
        let elemrect = element.getBoundingClientRect()
        let bodyrect = this.body.getBoundingClientRect()
        //let parentrect = parent.getBoundingClientRect()
    
        if (elemrect.right <= bodyrect.width / 2) {
            container.style.left = `${elemrect.right}px`
            container.style.top = `${elemrect.top}px`
            this.body.appendChild(container)
        } else {
            container.style.left = `${elemrect.left}px`
            container.style.top = `${elemrect.bottom}px`
            this.body.appendChild(container)
        }
    
        let exceptrect = except.getBoundingClientRect()
        exceptlist.style.setProperty("left", `${exceptrect.right - exceptrect.left}px`)
        exceptlist.style.setProperty("top", `${exceptrect.bottom - exceptrect.top}px`)
    }
    
    smallscan(article) {
        const func = article["func"]
        document.querySelectorAll(this.wcag[article].query).forEach((e) => {
            if (func(e)) {
                createPop(this.wcag[article].text, e, this.wcag[article].exceptions)
            }
        })
    }

    scan() {
        for (const i in this.wcag) {
            this.smallscan(wcag[i])
        }
    }
    
    checkImg(element) {
        if (!(element.hasAttribute("alt"))) {
            return true
        }
        return false
    }
    
    checknames(element) {
        if (element.innerText) {
            if (!(element.getAttribute("name")) == element.innerText) {
                return true
            }
        }
        let label = document.querySelector(`label[for=${element.getAttribute("id")}]`)
        if (label) {    
            if (!(element.getAttribute("name")) == label.innerText) {
                return true
            }
        }
        return false
    }
    
    checklabels(element) {
        let label = document.querySelector(`label[for=${element.getAttribute("id")}]`)
        if (!(label || element.innerText)) {
            return true
        }
        return false
    }
    
    correctnames() {
        document.querySelector("input, button, select").forEach((e) => {
            let label = document.querySelector(`label[for=${e.getAttribute("id")}]`)
            if (e.getAttribute("name") != e.innerText) {
                e.setAttribute("name", e.innerText)
            }
            if (label && e.getAttribute("name") != label.innerText) {
                e.setAttribute("name", label.innerText)
            }
        })
    }
    
    timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
    
    async checkAudio(element) {
        if (!(element.paused)) {
            await this.atimeout(ms)
            return !(element.paused)
        }
        return false
    }
    
    SRDescription(id, description) {
        const element = document.querySelector(`#${id}`)
        const desc = document.createElement("span")
        desc.innerText = description + ":"
        this.insertBefore(desc, element)
    }
    
    changeAudio(volume) {
        document.querySelectorAll("audio, video").forEach((e) => {
            if (!(e.hasAttribute("volume"))) {
                e.setAttribute("volume", volume)
            } else {
                e.setAttribute("volume", "" + (e.getAttribute("volume") * volume))
            }
        })
    }
    
    createAudioControler() {
        const container = document.createElement("div")
        const controler = document.createElement("input")
        const img = document.createElement("img")
        img.setAttribute("src", "../static/Speaker_Icon.png")
        controler.setAttribute("type", "range")
        controler.setAttribute("class", "AceTKSelector")
        container.setAttribute("class", "AceTKSelectorContainer")
        controler.setAttribute("max", "1.5")
        controler.setAttribute("min", "0.0")
        controler.setAttribute("step", "0.1")
        controler.setAttribute("value", "1.0")
        container.appendChild(img)
        container.appendChild(controler)
    
        controler.addEventListener("onchange", () => {
            this.changeAudio(controler.getAttribute("value"))
        })
    
        /*addRule("input.AceTKSelector", {
            display: "block"
        })*/
        
        this.addRule("div.AceTKSelectorContainer", {
            "width": "11vw", 
            "background-color": "black", 
            "display": "flex", 
            "align-items": "center", 
            "height": "5vh",
            "position": "fixed",
            "bottom": 0,
            "left": "44.5vw",
            "right": "44.5vw"
        })
    
        this.addRule("input.AceTKSelector", {
            "apearence": "none",
            "accent-color": "white",
            "border": "none",
            "width": "7.8vw"
        })
    
        this.addRule("div.AceTKSelectorContainer > img", {
            "width": "1.9vw",
            "height": "1.9vw",
            "margin-left": "0.5vw"
        })
    
        this.body.appendChild(container)
    }
    
    createSkipper(query) {
        const skipper = document.createElement("input")
        skipper.setAttribute("type", "checkbox")
        skipper.setAttribute("class", "AceTKBypassBlock")
        const container = document.createElement("div")
        container.setAttribute("class", "AceTKBypassContainer")
        container.innerText = "Hide Content"
        let elemrect;
        let contrect;
        let idcounter = 0;
        let ska;
        let cont;
    
        document.querySelectorAll(query).forEach((e) => {
            ska = skipper.cloneNode(true)
            cont = container.cloneNode(true)
            ska.addEventListener("change", (event) => {
                if (event.target.checked) {
                    e.style.setProperty("display", "none")
                } else {
                    e.style.removeProperty("display")
                }
            })
    
            cont.appendChild(ska)
            this.insertAfter(cont, e)
            elemrect = e.getBoundingClientRect()
            contrect = cont.getBoundingClientRect()
            cont.style.setProperty("position", "relative")
            cont.style.setProperty("left", `calc(${elemrect.right - elemrect.left}px - 8vw)`)
            this.skippers.push(cont)
            window.addEventListener("resize", () => {
                this.skippers.forEach((element) => {
                    let elemrect = e.getBoundingClientRect()
                    element.style.setProperty("left", `calc(${elemrect.right - elemrect.left}px - 8vw)`)
                })
            })
        })
    
        this.addRule("input.AceTKBypassBlock", {
            "accent-color": "white",
            "height": "100%"
        })
    
        this.addRule("div.AceTKBypassContainer", {
            "background-color": "black",
            "width": "8vw",
            "height": "3vh",
            "display": "flex",
            "align-content": "center",
            "color": "white",
            "font-size": "1.1vw",
            "font-family": "Sans-Serif"
        })
    }

    newId(list) {
        let id = parseInt(list[list.length]);
        if (!id) {
            id = 0;
        }
        while (list.includes(id)) {
            id++;
        }
        return id;
    }

    setSpacing(num, element) {
        let win = window.getComputedStyle(element)
        let fontSize = win.fontSize
    
        element.style.wordSpacing = `calc(${fontSize} * 0.32 * ${num})`
        element.style.lineHeight = `calc(${fontSize} * 2.4 * ${num})`
        element.style.letterSpacing = (num == 0.5 ? 0 : `calc(${fontSize} * 0.08 * ${num})`)
    
        element.childNodes.forEach((e) => {
            if (e.tagName) {
                this.setSpacing(num, e)
            }
        })
    }

    individualFontReset(element) {
        element.style.removeProperty("font-size")
        element.childNodes.forEach((e) => {
            if (e.tagName && e.getAttribute("type") != "range") {
                this.individualFontReset(e)
            }
        })
        element.removeAttribute("accessibility-toolkit-id")
        this.sizesList = {"sizes": [], "id": []}
    }

    resetFont(element) {
        this.individualFontReset(element)
        this.changeFont((this.panel_vals["size"] ||  1), this.body)
    }

    changeFont(size, element) {
        let font;
        let win = window.getComputedStyle(element)
        let id = parseInt(element.getAttribute("accessibility-toolkit-id"))
    
        if ((element.hasAttribute("accessibility-toolkit-id")) && (id in this.sizesList.id)) {
            let index = this.sizesList.id.indexOf(id)
            font = this.sizesList.sizes[index]
        } else {
            font = win.getPropertyValue("font-size")
            id = this.newId(this.sizesList.id)
            element.setAttribute("accessibility-toolkit-id", id)
            this.sizesList.sizes.push(font)
            this.sizesList.id.push(id)
        }
        
        element.style.setProperty("font-size", `calc(${size} * ${font})`);
        element.childNodes.forEach((e) => {
            if (e.tagName) {
                this.changeFont(size, e)
            }
        })
    }

    setContrast(ratio) {
        document.querySelectorAll("body *").forEach((e) => {
            console.log("\n")
            // Gets the computed style of the current element
            let style = window.getComputedStyle(e)
    
            e.style.removeProperty("color")
            e.style.removeProperty("background-color")
            
            // Gets the string formated RGB value and converts to an array
            let color = this.parseColor(style.color)
            let back = this.parseColor(style.backgroundColor)
            
            // This formula comes from the very Web Content Acessibility Guidelines definition of Luminance and Contrast Ratio. If you're confused, give it a check
            let csRGB = []
            color.forEach((e, i) => {
                csRGB[i] = e / 255
            })
            let bsRGB = []
            back.forEach((e, i) => {
                bsRGB[i] = e / 255
            })
            
            let cRGB = []
            csRGB.forEach((e, i) => {
                if (e <= 0.03928) {
                    cRGB[i] = e / 12.92
                } else {
                    cRGB[i] = ((e + 0.055) / 1.055) ** 2.4
                }
            })
            let bRGB = []
            bsRGB.forEach((e, i) => {
                if (e <= 0.03928) {
                    bRGB[i] = e / 12.92
                } else {
                    bRGB[i] = ((e + 0.055) / 1.055) ** 2.4
                }
            })
    
            let csum = color.reduce((acc, cur) => { return acc + cur })
            let bsum = back.reduce((acc, cur) => { return acc + cur })
    
            // The proportion of each color within the whole
            let cp = []
            color.forEach((e, i) => {
                cp[i] = e / (csum + 1)
            })
    
            // The proportion of each color within the whole of the background color
            let bp = []
            back.forEach((e, i) => {
                bp[i] = e / (bsum + 1)
            })
    
            //console.log(`Element is ${e.tagName} cp is ${cp} and bp is ${bp}`)
            
            let constant = [0.2126, 0.7152, 0.0722]
    
            let cl = constant[0] * cRGB[0] + constant[1] * cRGB[1] + constant[2] * cRGB[2]
            let bl = constant[0] * bRGB[0] + constant[1] * bRGB[1] + constant[2] * bRGB[2]
    
            if (cl + 0.05 > bl + 0.05) {
                if ((cl + 0.05) / (bl + 0.05) >= ratio) {
                    return
                }
    
                // Ideal values for Color Luminance and Background Luminescence to reach the desired ratio
                let icl = cl * ratio / 2
                let ibl = (icl + 0.05) / ratio - 0.05
                if (ibl < 0) {
                    ibl = 0
                }
                if (icl < cl) {
                    icl = cl
                }
                if (icl > 1) {
                    icl = 1
                    ibl = (icl + 0.05) / ratio - 0.05
                }
                if (ibl > bl) {
                    ibl = bl
                }
                console.log(`color is ${color}, back is ${back}, cl is ${cl} and bl is ${bl}`)
                console.log(`icl is ${icl} and ibl is ${ibl}`)
    
                // The difference between the ideal luminance and the actual luminance
                let cd = icl - cl
                let bd = bl - ibl
                //console.log(`cd is ${cd} and bd is ${bd}`)
    
                let rcd = (cd < 0.03928) ? cd * 12 * 255 : (cd ** (1/2.4) * 1.055 - 0.055) * 255;
    
                let rbd = (bd < 0.03928) ? bd * 12 * 255 : (bd ** (1/2.4) * 1.055 + 0.055) * 255;
    
                let icolor = cp.map((e, i) => {
                    return (e != 0) ? color[i] + rcd * e / (constant[i] / e): 0
                })
    
                let iback = bp.map((e, i) => {
                    return (e != 0) ? back[i] - rbd * e / (constant[i] / e): 0
                })
    
                console.log(`cp is ${cp} and bp is ${bp} icolor is ${icolor} and iback is ${iback}`)
    
                let crest = 0;
                let brest = 0;
                
                // Add the value proportionally
                let newColor = color.slice(0, 3);
                let ccomp = [];
                newColor = newColor.map((e, i) => {
                    let n = icolor[i]
                    if (n > 255) {
                        crest += n - 255
                        ccomp.push(i)
                        return 255
                    }
                    return n
                })
                while (crest > 0) {
                    if (ccomp.length === 3) {
                        brest -= crest;
                        crest = 0;
                        break;
                    }
                    newColor = newColor.map((e, i) => {
                        if (ccomp.includes(i)) {
                            return e
                        }
                        let n = e
                        if (crest > 0) {
                            n += crest
                            crest = 0
                        }
                        if (n > 255) {
                            ccomp.push(i)
                            crest += n - 255
                            return 255
                        }
                        return n
                    })
                }
    
                // Repeat the process to the Background
                let newBack = back.slice(0, 3);
                let bcomp = [];
                newBack = newBack.map((e, i) => {
                    let n = iback[i]
                    if (n < 0) {
                        brest += n
                        bcomp.push(i)
                        return 0
                    }
                    return n
                })
                while (brest > 0) {
                    if (bcomp.length == 3) {
                        crest -= brest;
                        brest = 0;
                        break;
                    }
                    newBack = newBack.map((e, i) => {
                        if (bcomp.includes(i)) {
                            return e
                        }
                        let n = e
                        if (brest < 0) {
                            n += brest
                            brest = 0
                        }
                        if (n < 0) {
                            bcomp.push(i)
                            brest += n
                            return 0
                        }
                        return n
                    })
                }
    
                while (crest > 0) {
                    if (ccomp.length == 3) {
                        brest -= crest;
                        crest = 0;
                        break;
                    }
                    newColor = newColor.map((e, i) => {
                        if (ccomp.includes(i)) {
                            return e
                        }
                        let n = e
                        if (crest > 0) {
                            n += crest
                            crest = 0
                        }
                        if (n > 255) {
                            ccomp.push(i)
                            crest += n - 255
                            return 255
                        }
                        return n
                    })
                }
    
                console.log(`The new font-color was set to ${newColor} and background to ${newBack}`)
                console.log(`rcd was ${rcd} and rbd was ${rbd}`)
    
                e.style.setProperty("color", `rgb(${newColor[0]}, ${newColor[1]}, ${newColor[2]})`)
                e.style.setProperty("background-color", `rgb(${newBack[0]}, ${newBack[1]}, ${newBack[2]})`)
    
                csRGB = []
                newColor.forEach((e, i) => {
                    csRGB[i] = e / 255
                })
                bsRGB = []
                newBack.forEach((e, i) => {
                    bsRGB[i] = e / 255
                })
                
                cRGB = []
                csRGB.forEach((e, i) => {
                    if (e <= 0.03928) {
                        cRGB[i] = e / 12.92
                    } else {
                        cRGB[i] = ((e + 0.055) / 1.055) ** 2.4
                    }
                })
                bRGB = []
                bsRGB.forEach((e, i) => {
                    if (e <= 0.03928) {
                        bRGB[i] = e / 12.92
                    } else {
                        bRGB[i] = ((e + 0.055) / 1.055) ** 2.4
                    }
                })
    
                cl = constant[0] * cRGB[0] + constant[1] * cRGB[1] + constant[2] * cRGB[2]
                bl = constant[0] * bRGB[0] + constant[1] * bRGB[1] + constant[2] * bRGB[2]
                console.log(`New cl is ${cl} and new bl is ${bl}`)
            } else if (bl + 0.05 > cl + 0.05) {
                if ((bl + 0.05) / (cl + 0.05) >= ratio) {
                    return
                }
    
                // Ideal values for Color Luminance and Background Luminescence to reach the desired ratio
                let ibl = bl * ratio / 1.5
                let icl = (ibl + 0.05) / ratio - 0.05
                if (icl < 0) {
                    icl = 0
                }
                if (ibl < bl) {
                    ibl = bl
                }
                if (ibl > 1) {
                    ibl = 1
                    icl = (ibl + 0.05) / ratio - 0.05
                }
                if (icl > cl) {
                    icl = cl
                }
                console.log(`color is ${color}, back is ${back}, cl is ${cl} and bl is ${bl}`)
                console.log(`icl is ${icl} and ibl is ${ibl}`)
    
                // The difference between the ideal luminance and the actual luminance
                let bd = ibl - bl
                let cd = cl - icl
                //console.log(`cd is ${cd} and bd is ${bd}`)
    
                let rbd = (bd < 0.03928) ? bd * 12 * 255 : (bd ** (1/2.4) * 1.055 - 0.055) * 255;
    
                let rcd = (cd < 0.03928) ? cd * 12 * 255 : (cd ** (1/2.4) * 1.055 + 0.055) * 255;
    
                let iback = bp.map((e, i) => {
                    return (e != 0) ? back[i] + rbd * e / (constant[i] / e): 0
                })
    
                let icolor = cp.map((e, i) => {
                    return (e != 0) ? color[i] - rcd * e / (constant[i] / e): 0
                })
    
                console.log(`cp is ${cp} and bp is ${bp} icolor is ${icolor} and iback is ${iback}`)
    
                let brest = 0;
                let crest = 0;
                
                // Add the value proportionally
                let newBack = back.slice(0, 3);
                let bcomp = [];
                newBack = newBack.map((e, i) => {
                    let n = iback[i]
                    if (n > 255) {
                        brest += n - 255
                        bcomp.push(i)
                        return 255
                    }
                    return n
                })
                while (brest > 0) {
                    if (bcomp.length === 3) {
                        crest -= brest;
                        brest = 0;
                        break;
                    }
                    newBack = newBack.map((e, i) => {
                        if (bcomp.includes(i)) {
                            return e
                        }
                        let n = e
                        if (brest > 0) {
                            n += brest
                            brest = 0
                        }
                        if (n > 255) {
                            bcomp.push(i)
                            brest += n - 255
                            return 255
                        }
                        return n
                    })
                }
    
                // Repeat the process to the Background
                let newColor = color.slice(0, 3);
                let ccomp = [];
                newColor = newColor.map((e, i) => {
                    let n = icolor[i]
                    if (n < 0) {
                        crest += n
                        ccomp.push(i)
                        return 0
                    }
                    return n
                })
                while (crest > 0) {
                    if (ccomp.length == 3) {
                        brest -= crest;
                        crest = 0;
                        break;
                    }
                    newColor = newColor.map((e, i) => {
                        if (ccomp.includes(i)) {
                            return e
                        }
                        let n = e
                        if (crest < 0) {
                            n += crest
                            crest = 0
                        }
                        if (n < 0) {
                            ccomp.push(i)
                            crest += n
                            return 0
                        }
                        return n
                    })
                }
    
                while (brest > 0) {
                    if (bcomp.length == 3) {
                        crest -= brest;
                        brest = 0;
                        break;
                    }
                    newBack = newBack.map((e, i) => {
                        if (bcomp.includes(i)) {
                            return e
                        }
                        let n = e
                        if (brest > 0) {
                            n += brest
                            brest = 0
                        }
                        if (n > 255) {
                            bcomp.push(i)
                            brest += n - 255
                            return 255
                        }
                        return n
                    })
                }
    
                console.log(`The new font-color was set to ${newColor} and background to ${newBack}`)
                console.log(`rcd was ${rcd} and rbd was ${rbd}`)
    
                e.style.setProperty("color", `rgb(${newColor[0]}, ${newColor[1]}, ${newColor[2]})`)
                e.style.setProperty("background-color", `rgb(${newBack[0]}, ${newBack[1]}, ${newBack[2]})`)
    
                csRGB = []
                newColor.forEach((e, i) => {
                    csRGB[i] = e / 255
                })
                bsRGB = []
                newBack.forEach((e, i) => {
                    bsRGB[i] = e / 255
                })
                
                cRGB = []
                csRGB.forEach((e, i) => {
                    if (e <= 0.03928) {
                        cRGB[i] = e / 12.92
                    } else {
                        cRGB[i] = ((e + 0.055) / 1.055) ** 2.4
                    }
                })
                bRGB = []
                bsRGB.forEach((e, i) => {
                    if (e <= 0.03928) {
                        bRGB[i] = e / 12.92
                    } else {
                        bRGB[i] = ((e + 0.055) / 1.055) ** 2.4
                    }
                })
    
                cl = constant[0] * cRGB[0] + constant[1] * cRGB[1] + constant[2] * cRGB[2]
                bl = constant[0] * bRGB[0] + constant[1] * bRGB[1] + constant[2] * bRGB[2]
                console.log(`New cl is ${cl} and new bl is ${bl}`)
            } else {
                return
            }
        })
    }

    parseColor(string) {
        let a;
        if (string.slice(0, 4) == "rgba") {
            a = string.slice(5, -1).split(",")
            a.forEach((e, i) => {
                a[i] = parseInt(e)
            })
            return a
        } else if (string.slice(0, 3) == "rgb") {
            a = string.slice(4, -1).split(",")
            a.forEach((e, i) => {
                a[i] = parseInt(e)
            })
            return a
        }
    }

    createResizePanel() {
        let holder = document.createElement("div");
        holder.setAttribute("class", "AceTKPanelContainer")
        this.addRule(".AceTKPanelContainer", {
            "width": "min-content",
            "padding-right": "2.5vw",
            "padding-top": "2.5vh",
            "position": "absolute",
            "top": "0",
            "right": "0"
        })
        this.body.appendChild(holder);
    
        let panel_button = document.createElement("button");
        panel_button.style.setProperty("width", "12vw");
        panel_button.setAttribute("class", "AceTKOpenPanel")
        panel_button.innerText = "Acessibility Panel"
        holder.appendChild(panel_button)
    
        let panel = document.createElement("div")
        panel.setAttribute("class", "AceTKPanel")
    
        let closep = document.createElement("button")
        closep.style.setProperty("width", "12vw")
        closep.innerText = "Close Panel"
        panel.appendChild(closep)
    
        panel.style.setProperty("display", "none");
        holder.appendChild(panel)
    
        panel_button.addEventListener("click", () => {
            panel.style.setProperty("display", "flex")
            panel_button.style.setProperty("display", "none")
        })
        
        closep.addEventListener("click", () => {
            panel_button.style.setProperty("display", "block")
            panel.style.setProperty("display", "none")
        })
    
        this.addRule(".AceTKOpenPanel", {
            "background-color": this.color,
            "color": this.seccolor
        })
        
        this.addRule(".AceTKPanel", {
            "display": "flex",
            "background-color": this.color,
            "color": this.seccolor,
            "width": "12.5vw",
            "flex-direction": "column",
            "align-items": "center",
            "flex-wrap": "wrap",
            "accent-color": this.seccolor,
            "font-family": "Arial",
            "text-align": "center"
        })
    
        this.addRule(".AceTKPanel input[type='range']", {
            "width": "100%",
            "margin-left": "-0.5px"
        })
    
        this.addRule(".AceTKPanel button", {
            "background-color": this.seccolor,
            "color": this.color,
            "width": "100%",
            "margin-left": "-1%"
        })
    
        let fontlabel = document.createElement("label")
        fontlabel.setAttribute("for", "AceTKFontRange")
        fontlabel.innerText= "Change Font Size"
        panel.appendChild(fontlabel)
        
        let fontrange = document.createElement("input");
        fontrange.setAttribute("type", "range");
        fontrange.setAttribute("min", "1");
        fontrange.setAttribute("max", "2");
        fontrange.setAttribute("value", "1");
        fontrange.setAttribute("step", "0.125");
        fontrange.setAttribute("id", "AceTKFontRange")
        panel.appendChild(fontrange);
    
        this.changeFont(fontrange.value || 1, this.body)
    
        let spacelabel = document.createElement("label")
        spacelabel.setAttribute("for", "AceTKSpaceRange")
        spacelabel.innerText = "Change Text Spacing"
        panel.appendChild(spacelabel)
    
        let spacerange = document.createElement("input");
        spacerange.setAttribute("type", "range");
        spacerange.setAttribute("min", "0.5");
        spacerange.setAttribute("max", "1.5");
        spacerange.setAttribute("step", "0.125");
        spacerange.setAttribute("value", "0.5");
        spacerange.setAttribute("id", "AceTKSpaceRange");
        panel.appendChild(spacerange);
    
        this.setSpacing(spacerange.value || 0.5, this.body);
    
        let contlabel = document.createElement("label");
        contlabel.setAttribute("for", "AceTKContrastRange");
        contlabel.innerText= "Change Page's Contrast";
        panel.appendChild(contlabel);
        
        let contrange = document.createElement("input");
        contrange.setAttribute("type", "range");
        contrange.setAttribute("min", "1");
        contrange.setAttribute("max", "7");
        contrange.setAttribute("value", "1");
        contrange.setAttribute("step", "0.5");
        contrange.setAttribute("id", "AceTKContrastRange");
        panel.appendChild(contrange);
    
        this.setContrast(contrange.value || 0);
    
        fontrange.addEventListener("change", (e) => {
            this.panel_vals["size"] = fontrange.value;
            this.panel_vals["spacing"] = spacerange.value;
            this.panel_vals["contrast"] = contrange.value;
            this.changeFont(this.panel_vals["size"], this.body);
            this.setSpacing(this.panel_vals["spacing"], this.body);
            this.setContrast(this.panel_vals["contrast"]);
        });
    
        contrange.addEventListener("change", (e) => {
            this.panel_vals["size"] = fontrange.value;
            this.panel_vals["spacing"] = spacerange.value;
            this.panel_vals["contrast"] = contrange.value;
            this.changeFont(this.panel_vals["size"], this.body);
            this.setSpacing(this.panel_vals["spacing"], this.body);
            console.log(`Now setting contrast at a ratio of ${this.panel_vals["contrast"]}`)
            this.setContrast(this.panel_vals["contrast"]);
        });
    
        spacerange.addEventListener("change", (e) => {
            this.panel_vals["size"] = fontrange.value;
            this.panel_vals["spacing"] = spacerange.value;
            this.panel_vals["contrast"] = contrange.value;
            this.changeFont(this.panel_vals["size"], this.body);
            this.setSpacing(this.panel_vals["spacing"], this.body);
            this.setContrast(this.panel_vals["contrast"]);
        });
    
        window.addEventListener("resize", (e) => {
            this.resetFont(this.body)
            this.changeFont(this.panel_vals["size"], this.body)
            this.setSpacing(this.panel_vals["spacing"], this.body);
        })
    
        document.querySelectorAll(".detect-resize").forEach((element) => {
            element.addEventListener("resize", (e) => {
                this.resetFont(this.body)
                this.changeFont(this.panel_vals["size"], e.target)
                this.setSpacing(this.panel_vals["spacing"], e.target);
            })
        })
    }
}

module.exports = { AceClass }