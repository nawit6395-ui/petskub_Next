
function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function luminance(r, g, b) {
    var a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

const white = [255, 255, 255];
const currentPrimary = hslToRgb(25, 100, 44);
console.log(`Current Primary (25, 100, 44): RGB(${currentPrimary.map(x => x.toFixed(0))})`);
console.log(`Contrast with White: ${contrast(currentPrimary, white).toFixed(2)}`);

// Try darker
for (let l = 44; l >= 30; l--) {
    const c = hslToRgb(25, 100, l);
    const ratio = contrast(c, white);
    if (ratio >= 4.5) {
        console.log(`PASSING: Lightness ${l}% -> RGB(${c.map(x => x.toFixed(0))}) Ratio: ${ratio.toFixed(2)}`);
        break;
    } else {
        // console.log(`Failing: Lightness ${l}% -> Ratio: ${ratio.toFixed(2)}`);
    }
}
