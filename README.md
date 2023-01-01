# AceTK
#### Video Demo: URL
#### Description:
> From Github, actually...

AceTK (Abbreviation for Accessibility Toolkit) is a npm package originally made as a CS50 Final Project whhich has the purpose of providing utility features to help your site to conform with WCAG 2.1, and also make it more accessible in general. The project is currently under improvement, and thus a lot of changes are coming in a near future.

### General Documentation:
AceTK's primary purpose is to help web developers to conform with WCAG 2.1 and make them's sites more accessible in general. **Though AceTK *doesn't* automatically make your stie to conform with WCAG**, it can efficiently help it to conform when used properly 

The functions are entirely inside AceClass class (And thus in the AceTK object). This is a Design Choice to prevent coliding names between the AceTK code and the user code, since it is primarily meant to be imported via script tag. The functions are primarily dividend between Scanning meant to be used in Development and Functions to be used to create Accessibility Mechanisms in production

#### Set Color:
The function setColor() changes the AceClass colors (Stored in the AceClass constructor). These colors will be used to every element created by AceTK, such as accessibility panels and popups.

#### Scanning:
The scan() Function is a Development-Only function that create interactive Popups alerting the developer for potential accessibility issues. The popups will be shown in the pre-set AceTK color and will appear in the front of the non-accessible elements (Such as images without "alt" attribute). The user is provided with a list of possible exceptions for that problem which, when clicked, make the popup to disapear (It's presumed that the element fits in one of that exceptions when the button is clicked)

```
scan() {
        for (const i in this.wcag) {
            this.smallscan(wcag[i])
        }
    }
```

##### Design choices:
The scan function relies on two important objects: The WCAG object and the smallscan() function.
The WCAG function is a Object that contains multiple objects, which one representing a WCAG article with it's popup text, scan function, scan query and possible exceptions (Using the very WCAG list of exceptions, if the article does have one). This is made in order to keep organized what function, query and expection list belong to each article

```
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
        [...]
}
```

The smallscan() function, in the order hand, has the function to take all the properties of a WCAG property and use it to scan the whole document, putting popups where is necessary.

```
smallscan(article) {
    const func = article["func"]
    document.querySelectorAll(this.wcag[article].query).forEach((e) => {
        if (func(e)) {
            createPop(this.wcag[article].text, e, this.wcag[article].exceptions)
        }
    })
}
```

The function createPop() is used to create a Popup element and position it (with position: "absolute") based in the getBoundingClientRect() coordinates

#### ChangeFont
ChangeFont() is a function that increases font-size up to a specific proportion in order to conform with the WCAG article 1.4.4.

##### Design Choices
The function itself is meant to be used along with a input tag in order to create usefull acessibility mechanisms, though it is not forbiden to use it without a input tag.
It recursively iterates over every element of the page saving it's original font-size. This is usefull because it doesn't let changes stack, since every change will now be made based in the original font-size value. To better identify which element has which font-size, elements are given a custom AceTK attribute, the acessibility-toolkit-id. This is used to identify each element in the sizesList object and make it easier to search through the array searching for the current element.
Last but not less important, it uses calc() from CSS to multiplicate the font-size by the size parameter

```
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
```

#### SetSpacing
Similar to changeFont(), the setSpacing() function multiplies text spacing for a given number, except that it multiplies word-spacing, line-height and letter-spacing and make the calculations based in a constant for each one of the values

##### Design Choices
The constants come from the very WCAG article on Text Spacing (1.4.12) except for the word-spacing, which is half of the constant because it has the lower initial value from all the properties.
It's behavior is preety similar to changeFont, iterating recursively through every element and multiplying it's font-size with the constant and the num, except that it doesn't save the original value because the values are absolute and don't rely on the previous spacing, making it impossible to stack (As opposed to changeFont, where the calculations make possible to stack changes)

```
setSpacing(num, element) {
    if (!element) element = document.querySelector("body")

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
```

#### SetContrast
setContrast() function calculates the relative luminance of a text and it's background and then change it's luminance until they reach the given constrast ratio.

##### Design Choices
This function's behavior is particularly interesting. It basically calculates an ideal luminance for both color and background, calculates the difference between ideal and real, and then convert this difference to 8bit values, and then calculates the ideal color using the following formula:

```
idealcolor[i] = (p[i] != 0) ? realcolor[i] + rd * p[i] / (constant[i] / 510) : 0
```

Consider:
> p = An array with the proportion of each color in the total sum of the RGB values

> rd = The 8bit difference previously calculated

> constant = The WCAG constants in the calculation of relative luminance

The calculations's purpose are actually preety simple. It sums the difference with the proportion of the color in order to maintain the original color (but brigther), and increases the value *inversely* proportional to the constant, as colors that have less relevance in the luminance calculations will need to have increased values to reach the desired luminance. By the way, if you have any doubt about contrast ratio and relative luminance calculation, make sure to check WCAG glossary of terms to see the formulas.

Last but not less important, it substitutes the color and background color by the ideal values, transfering the excedent (cases where the ideal value is higher than 255) to the other colors

#### CreateAudioControler
createAudioControler() function creates a audio controler at the bottom of the page that changes the volume of every single audio tag in the page via a range input at the bottom of the page.

##### Design Choices
The behavior is preety simple, actually. It takes the very volume HTML Attribute and multiplies it to a scale of 0 to 1.5, and thus guarante that it will not be harmful to a sensible user.

The Audio Controler itself calls for the function changeAudio, and thus the user can create him/her's own Audio Controler with an input tag and the mechanism class (Which will be explained later)

#### SRDescription
SRDescription() creates an element that is only visible by a ScreenReader

##### Design Choices
It basically creates an element that's 1x1px, thus only being readable by a screan reader. Preety straightforward

#### CreateAcePanel
The createAcePanel() function creates a panel with 3 range inputs (properly labeled), that when changed activate the functions changeFont(), setSpacing() and setContrast(). The panel is created in the set colors.

##### Design Choices
The panel basically consists in a container that holds both the opening button and the panel itself. These two elements alternate display none and block, thus making the impression of "opening" the panel.

The main function of this Panel is to create a simple way to make a customizable panel with the most important accessibility features with low or no effort if the user is not interesed in making his/her's very own accessibility mechanisms.

#### Mechanism Class
The Mechanism Class is a class that make it easier to attribute listeners and callback functions to inputs and buttons which can be used along with the AceTK functions to create Powerfull Accessibility Mechanisms

##### Design Choices
The Class takes in two obligatory parameters: Query and Function, being the query the queryselector that points to the desired element and the Function being the callback function that will be called by the event listener.

The class also has a Proxy with the Constructor trap to add a EventListener to the Element immeaditly when the new operator is called for a mechanism.

The design of this functions is mostly for requiring as little effort as possible from the (web) developer, such as usign a queryselector in the class instead of having to select the element previsously to add the event lsitener, and adding the event listener immeadtly at the creation of the class, with no need for any function call. This is intended to incentive the developer to create his/hers very own mechanisms and thus make it's sites more accessible in a way that fits the general design of the site.

```
class activator{
    constructor(query, func, listener, input) {
        this.query = query
        this.func = func
        this.listener = listener
        this.input = input
    }

    label (text) {
        let label = document.createElement("label")
        label.setAttribute("for", query.id)
        label.innerText = text
        insertBefore(label, document.querySelector(this.query))
        return label
    }
}

const mechhandler = {
    construct(target, args) {
        const element = document.querySelector(args[0])
        if (!element) {
            return {}
        }
        const handlers = {"INPUT": "change", "BUTTON": "click"}
        element.addEventListener(((args[2]) ? args[2] : handlers[element.tagName]), args[1]((args[3]) ? args[3] : element.value))
        return new target(...args)
    }
}

const mechanism = new Proxy(activator, mechhandler);
```

The optional parameters are listener and input, which respectively represent the type of listener that will be added (change, click, etc.) and the input that represent from where the input for that function will come. These values, though, will be automatically determined if not inserted

The mechanism class brings also a label() method, which inserts a label with the given text right before the mechanism

#### Internal use functions
addRule() is used to transform a object in a CSS Rule and then inserts the rule into the stylesheet, which makes thing cleaner that it would if it was a .insertRule method, actually

insertAfter() and insertBefore() insert a HTML element before or after another using the built-in "Node.insertBefore" method and the "Node.nextSibling" method

parseColor() is used as a method to transform a rgb(r, g, b) formatted string to an array