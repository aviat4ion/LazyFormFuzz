# Lazy Form Fuzz
A bookmarklet for filling HTML forms with random data. 
Data is generated from regular expressions, using [RandExp](https://github.com/fent/randexp.js).

## Browser Support
IE 8+, Firefox, Chrome, Opera (Presto and Blink), and Safari

Supports single page and framed (iframes and framesets) forms.

## Form element support for autofilling
### Input Types
* color
* email
* number
* range
* search
* tel
* url
* date
* datetime
* datetime-local
* month
* week
* time
* checkbox
* radio
* text

### Other form elements
* textarea
* select

## Never filled form elements
### Input Types
* hidden
* password
* button
* file

### Attributes
* readonly
* disabled

## Custom Generation rules
LazyFormFuzz respects the pattern attribute on input elements, and will use it over built-in rules. 