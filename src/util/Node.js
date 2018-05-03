
/* eslint no-underscore-dangle: ["error", { "allowAfterThis": true }] */
export default class Node {
    constructor(data, ctx, hitCtx) {
        this.name = data.name;
        this.links = data.links;
        this.index = data.index;
        this._x = data.x;
        this._y = data.y;
        this._width = 1; // 40;
        this._height = 1; // 40;
        this.colorKey = data.colorKey;
        this.color = data.color;
        this.ctx = ctx;
        this.hitCtx = hitCtx;

        this.cluster = data.cluster;
        this.positives = data.positives;
        this.negatives = data.negatives;

        this.label = data.label;
        this.labels = data.labels;
        // x,y for reseting
        this.initX = data.x;
        this.initY = data.y;

        this.activeScale = 3; // showing images bigger
        this.scale = 1; // TODO is not needen anymore
        this.icon = new Image();
        this.icon.src = data.buffer;

        this._isActive = false; // handle clicked node
        this.isActiveNeighbour = false; // is this a neighbour of a active node?
        this.hasImage = false; // is there detailed image?

        this.image = new Image();
        // this.image.src = `data:image/jpeg;base64,${data.buffer}`;

        this.scale = null; // used for scaling the x/y position
        this.imgScale = null; // used for scaling img width
        //
        this.timerId = 0;

        this._value = null; // value will be set by the active nodes neighbour-values, default is 5

        // this.imgData = makeImgageData(this.icon)
    }

    get width() {
        const w = this._width;
        if (this.isActive) return w + (w * this.activeScale);
        if (this.isActiveNeighbour) return w + (w * this.activeScale * this.value);
        return w;
    }

    set width(value) {
        this._width = value;
    }

    get height() {
        const h = this._height;
        if (this.isActive) return h + (h * this.activeScale);
        if (this.isActiveNeighbour) return h + (h * this.activeScale * this.value);
        return h;
    }

    set height(value) {
        this._height = value;
    }

    get value() {
        return this._value;
    }

    set value(v) {
        if (v < 0.1) this._value = 0.1;
        else if (v > 1) this._value = 1;
        else this._value = v;
    }

    get isActive() {
        return this._isActive;
    }

    set isActive(v) {
        this._isActive = v;

        /* if(this.timerId) clearInterval(this.timerId);
        this._isActive = v;
        if (v === true) {
            this._isActive = v;
            this.timerId = setInterval(() => {
                console.log(this.activeScale)
                this.activeScale += 0.1;
                ;
                if (this.activeScale >= 5) {
                    clearInterval(this.timerId);
                    this.activeScale = 5
                }
                this.triggerDraw()
            }, 100);
        } else if(v === false) {
            this.timerId = setInterval(() => {
                this.activeScale -= 0.1;
                this.triggerDraw();

                if (this.activeScale <= 1) {
                    this._isActive = v;
                    clearInterval(this.timerId);
                    this.activeScale = 1
                }
                this.triggerDraw();
            }, 100);
        } */
    }

    // if isActive
    // scale x to real/current 2d-coords
    // subtract half width for moving left, width scaled with ImageScale
    // scale back to Node x/y
    // TODO the last point is because of the context is scaling it again - maybe we could get rid of this?

    get x() {
        // return this._x - (this.width / 2 / this.scale);
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        // return this._y - (this.height / 2 / this.scale);
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    // simple changing the x/y is not possible because
    // they have special getters witch would be use while setting/+= values
    move(x, y) {
        this._x += x;
        this._y += y;
    }


    // ctx is the canvas context
    // scale change through zooming and is used for positioning the images
    async draw(scale, scale2, imgWidth, cluster) {
        // console.log('start draw Image');
        // check which picture to use
        // this.scale = 1; // scale;

        const imgData = this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ;
        */
        const w = imgData.width * imgWidth / 100 / scale2;
        const h = imgData.height * imgWidth / 100 / scale2;
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);


        // const data = await createImageBitmap(imgData, 0, 0, w, h)
        // createImageBitmap(imgData,0, 0, 2, 2, {resizeHeight: h, resizeWidth: w}).then(data => {
        //     console.log(data)
        //     this.ctx.drawImage(data, x, y)
        // })
        this.ctx.drawImage(imgData, x, y, w, h);


        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);


        // draw HitCanvas rect
    }

    drawClusterd(scale, scale2, imgWidth, cluster) {
        const s = 1 / scale;
        const x = this._x;
        const y = this._y;

        this.ctx.fillStyle = 'grey';
        this.ctx.fillRect(x, y, s, s);
    }

    drawAsActive(scale, activeImgWidth) {
        this.scale = 1; // scale;

        const imgData = this.icon; // this.hasImage ? this.image : this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ; */

        /* const w = activeImgWidth / 10;
        const h = activeImgWidth / 10; */
        const w = imgData.width * activeImgWidth / 1000; // TODO if image returns check if this width should be still used
        const h = imgData.height * activeImgWidth / 1000;
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);


        if (this.isActive) {
            // console.log(`Active node while draw: ${this.name}}`);
            // console.log(this);
            this.ctx.globalAlpha = 1;

            this.ctx.drawImage(imgData, x, y, w, h);
            this.ctx.globalAlpha = 0.3;
            // ctx.rect(this.x,this.y, this.width/scale,this.height/scale);
            // ctx.stroke();
        } else if (this.isActiveNeighbour) {
            // console.log(`Neighbour node while draw: ${this.name}}`);
            // console.log(this);
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(imgData, x, y, w, h);
            this.ctx.globalAlpha = 0.3;
        }
        // draw HitCanvas rect
        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);
    }

    drawAsNeighbour(scale, activeImgWidth, value) {
        this.scale = 1; // scale;

        const imgData = this.icon; // this.hasImage ? this.image : this.icon;

        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale / 2;
        const h = this.height; // scale / 2 ; */

        /* const w = (activeImgWidth / 10) * this.value;
        const h = (activeImgWidth / 10) * this.value; */
        const w = imgData.width * activeImgWidth / 1000 * this.value; // TODO if image returns check if this width should be still used
        const h = imgData.height * activeImgWidth / 1000 * this.value;
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);


        this.ctx.globalAlpha = 1;
        this.ctx.drawImage(imgData, x, y, w, h);
        this.ctx.globalAlpha = 0.3;

        // draw HitCanvas rect
        this.hitCtx.fillStyle = this.colorKey;
        this.hitCtx.fillRect(x, y, w, h);
    }


    drawBorder(scale, imgWidth, activeImgWidth, cluster, borderWidth, labelColor) {
        /* const x = this.x;
        const y = this.y;
        const w = this.width; // scale;
        const h = this.height; // scale;
        */

        const w = this.icon.width * (
            this.isActive
                ? activeImgWidth
                : this.isActiveNeighbour
                    ? activeImgWidth * this.value
                    : imgWidth
        ) / 1000;
        const h = this.icon.height * (
            this.isActive
                ? activeImgWidth
                : this.isActiveNeighbour
                    ? activeImgWidth * this.value
                    : imgWidth
        ) / 1000;
        /* const w = (this.isActive ? activeImgWidth : this.isActiveNeighbour ? activeImgWidth * this.value : imgWidth) / 10;
        const h = (this.isActive ? activeImgWidth : this.isActiveNeighbour ? activeImgWidth * this.value : imgWidth) / 10; */
        const x = this._x - (w / 2);
        const y = this._y - (h / 2);

        const lineWidth = borderWidth / 10 / scale;
        this.ctx.strokeStyle = labelColor || this.color;
        this.ctx.lineWidth = lineWidth;


        if ((this.cluster < cluster) || this.isActive || this.isActiveNeighbour) {
            // cluster represent
            if (lineWidth) this.ctx.strokeRect(x, y, w, h);
        } else {
            if (lineWidth) this.ctx.strokeRect(x, y, w / scale, h / scale);
            this.hitCtx.fillStyle = this.colorKey;
            this.hitCtx.fillRect(x, y, w / scale, h / scale);
        }
    }


    // unused cause of non-math method for findNodeUnderMouse
    /* contains(x, y, scale) {
        // All we have to do is make sure the Mouse X,Y fall in the area between
        // the Node X and (X + Width) and its Y and (Y + Height)
        const w = this.width / scale;
        const h = this.height / scale;

        // const contains = (x >= this.x) && (x <= this.x + w) && (y >= this.y) && (y <= this.y + h);
        return (x >= this.x) && (x <= this.x + w) && (y >= this.y) && (y <= this.y + h);
        // console.log(contains);
        // console.log(this);
        // console.log({ mx, my, x, y, w, h });


        // return contains;
    } */
}
