function file_drop() {
    document.getElementById("file-input").click();
}

var scale = 1;
var x_off = 0;
var y_off = 0;

var prev_img_width = 0;
var prev_img_height = 0;
var img_width = 0;
var img_height = 0;

var font_width = 0;
var font_height = 0;

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function measure_font_mono(ctx, font) {
    ctx.font = font;

    //const metrics = ctx.measureText("abcdefghijklmnopqrstuvwxyz");
    //font_width = metrics.width / 26;
    //font_height = metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent;
    font_width = 1;
    font_height = 2;
}
var url;

function select_image() {
    const file = document.getElementById("file-input").files[0];
    if (file) {

        document.getElementById("file-select").hidden = true;
        document.getElementById("img-preview-outer").hidden = false;

        url = URL.createObjectURL(file);
        document.getElementById("img-preview-img").addEventListener("load", (e) => {
            const canvas = document.getElementById("preview-canvas");
            prev_img_width = canvas.width = e.target.width;
            prev_img_height = canvas.height = e.target.height;

            const ctx = canvas.getContext("2d");
            //console.log(ctx);
            measure_font_mono(ctx, `24px "JetBrains Mono"`);
            render_ascii_boundaries(ctx);

            canvas.addEventListener("wheel", (e) => {
                scale += e.deltaY * 0.01;
                scale = Math.max(0.01, Math.min(100, scale))
                x_off = x_off % (font_width * scale);
                y_off = y_off % (font_height * scale);
                if (x_off < 0) {
                    x_off += font_width * scale;
                }
                if (y_off < 0) {
                    y_off += font_height * scale;
                }
                e.preventDefault();
                render_ascii_boundaries(ctx);
            })
            var down;
            canvas.addEventListener("mousedown", (e) => {
                down = true;
            });
            canvas.addEventListener("mouseup", (e) => {
                down = false;
            });

            canvas.addEventListener("mousemove", (e) => {
                if (down) {
                    x_off += e.movementX;
                    y_off += e.movementY;
                    x_off = x_off % (font_width * scale);
                    y_off = y_off % (font_height * scale);
                    if (x_off < 0) {
                        x_off += font_width * scale;
                    }
                    if (y_off < 0) {
                        y_off += font_height * scale;
                    }
                    render_ascii_boundaries(ctx);
                }
            });
            window.addEventListener("resize", (e) => {
                const a = document.getElementById("img-preview-img")
                prev_img_width = canvas.width = a.width;
                prev_img_height = canvas.height = a.height;
                render_ascii_boundaries(ctx);

            })
        });
        document.getElementById("true-image").addEventListener("load", (e) => {
            const canvas = document.getElementById("true-canvas");
            canvas.width = img_width = e.target.width;
            canvas.height = img_height = e.target.height;
        })

        document.getElementById("true-image").src = url;
        document.getElementById("img-preview-img").src = url;
    } else {
        // No file was selected
    }
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 */
function render_ascii_boundaries(ctx) {
    ctx.clearRect(0, 0, prev_img_width, prev_img_height);
    ctx.beginPath();

    const x_end = x_off + Math.floor((prev_img_width - x_off) / (font_width * scale)) * font_width * scale;
    const y_end = y_off + Math.floor((prev_img_height - y_off) / (font_height * scale)) * font_height * scale;
    for (var x = x_off; x <= x_end + 2; x += font_width * scale) {
        ctx.moveTo(x, y_off);
        ctx.lineTo(x, y_end);
    }
    for (var y = y_off; y <= y_end + 2; y += font_height * scale) {
        ctx.moveTo(x_off, y);
        ctx.lineTo(x_end, y);
    }
    ctx.stroke();
    //ctx.fillStyle = "black";
    //ctx.fillRect(0, 0, img_width, img_height);
    const n_x = Math.floor((prev_img_width - x_off) / (font_width * scale));
    const n_y = Math.floor((prev_img_height - y_off) / (font_height * scale));

    document.getElementById("res-val").innerText = `${n_x}x${n_y}`;
    document.getElementById("char-val").innerText = `${n_x*n_y}`;
}

//0.299R + 0.587G + 0.114B


function convert() {


    URL.revokeObjectURL(url);

    document.getElementById("final-output").hidden = false;
    document.getElementById("img-preview-outer").hidden = true;
    const canvas = document.getElementById("true-canvas");
    /**
     * @type {CanvasRenderingContext2D}
     */
    const ctx = canvas.getContext("2d");

    ctx.drawImage(document.getElementById("true-image"), 0, 0);
    const img = ctx.getImageData(0, 0, img_width, img_height);

    // const x_end = x_off + Math.floor((img_width - x_off) / (font_width * scale)) * font_width * scale;
    // const y_end = y_off + Math.floor((img_height - y_off) / (font_height * scale)) * font_height * scale;
    // for (var x = x_off; x <= x_end + 2; x += font_width * scale) {
    //     ctx.moveTo(x, y_off);
    //     ctx.lineTo(x, y_end);
    // }
    // for (var y = y_off; y <= y_end + 2; y += font_height * scale) {
    //     ctx.moveTo(x_off, y);
    //     ctx.lineTo(x_end, y);
    // }
    // ctx.stroke();
    const index = (x, y) => {
        return (y * img_width + x) * 4;
    };

    const a = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,\"\^\`'. ";
    //const a = " .:-=+*#%@";

    function char_from_intensity(intensity) {
        return a[Math.floor(a.length * intensity / 256)];
    }

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function escapeHtml(string) {
        return string.replace(/[&<>"'`=\/]/g, function(s) {
            return entityMap[s];
        });
    }

    var out = "";
    const s = (img_width / prev_img_width);
    const s_x = (img_width / prev_img_width) * (1 / (font_width * scale));
    const s_y = (img_height / prev_img_height) * (1 / (font_width * scale));
    const n_x = Math.floor((img_width - x_off * s) / (font_width * scale * s));
    const n_y = Math.floor((img_height - y_off * s) / (font_height * scale * s));
    console.log(img);
    var b = 0;
    const out_ele = document.getElementById("output");
    for (var j = 0; j < n_y; j++) {
        var row = ""
        for (var i = 0; i < n_x; i++) {

            var sum = 0;
            var n = 0;
            for (var x = (x_off * s + (font_width * scale) * s * i); x < x_off * s + (font_width * scale) * s * i + (font_width * scale) * s; x++) {
                for (var y = (y_off * s + (font_height * scale) * s * j); y < y_off * s + (font_height * scale) * s * j + (font_height * scale) * s; y++) {
                    const ind = index(Math.floor(x), Math.floor(y));
                    const g = 0.299 * img.data[ind] + 0.587 * img.data[ind + 1] + 0.114 * img.data[ind + 2];
                    //console.log(ind, g, x, y);
                    sum += g;
                    n++;
                }
            }

            const charInten = sum / n;
            //console.log(charInten, char_from_intensity(charInten))
            const c = char_from_intensity(Math.min(255, Math.max(charInten, 0)));
            if (c == undefined) {
                console.log(c, charInten)
            }
            row += c;
            b++;
        }
        out += row + "\n";
        while (row.length != 0) {
            const new_ele = document.createElement("span");
            new_ele.innerText = row.substring(0, 1000);
            row = row.substring(1000);
            out_ele.appendChild(new_ele);
        }
        out_ele.appendChild(document.createElement("br"));

    }

    const link = document.getElementById("download");
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(out);
    link.download = "rgbtoa.txt";
    //console.log(b);
    //document.getElementById("output").innerHTML = out;
}
var zoom = 1;

function zoom_in() {
    zoom += 0.1;
    document.getElementById("output").style.transform = `scale(${Math.exp(zoom)}, ${Math.exp(zoom)})`;
}

function zoom_out() {
    zoom -= 0.1;
    document.getElementById("output").style.transform = `scale(${Math.exp(zoom)}, ${Math.exp(zoom)})`;
}

function reset() {
    document.getElementById("file-select").hidden = false;
    document.getElementById("final-output").hidden = true;
    document.getElementById("img-preview-outer").hidden = true;
    document.getElementById("img-preview-img").src = "";
    document.getElementById("true-image").src = "";
    document.getElementById("file-input").value = null;
}