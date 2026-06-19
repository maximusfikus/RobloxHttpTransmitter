const e = require("express");

let input_A = 252
let input_B = 11111100

function intToByte(val) {
    return val.toString(2).padStart(8, '0')
}

function byteToInt(val) {
    return val.split('').reduce((acc, bit) => (acc << 1) | (bit === '1' ? 1 : 0), 0)
}

function byteSetlsb(val) {
    if (typeof val === 'string' && /^[01]{8}$/.test(val)) {
        return val.slice(0, -1) + '1';
    } else if (typeof val === 'number' && val >= 0 && val <= 255) {
        return (val | 0b00000001).toString(2).padStart(8, '0');
    }
    
}

console.log(intToByte(input_A))
//console.log(byteToInt(input_B))
console.log(byteSetlsb(input_B))
