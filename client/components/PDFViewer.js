import React, { PureComponent, Fragment } from 'react';
import { Affix, Pagination } from 'antd';
import PDFJS from 'pdfjs-dist';

export default class PDFViewer extends PureComponent {
    constructor(props) {
        super(props);
        this.onContextMenu = this.onContextMenu.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onChange = this.onChange.bind(this);
        this.state = {
            err: null,
        };
    }
    componentDidMount() {
        PDFJS.getDocument(this.props.src).then(doc => {
            this.setState({
                doc, page: 1,
            });
        }).catch(err => {
            this.setState({ err });
            console.log(err);
        });
    }
    componentDidUpdate() {
        this.renderDoc();
    }
    incPage() {
        const { page, doc } = this.state;
        if (page && doc && page < doc.numPages) {
            this.setState({ page: page + 1});
        }
    }
    decPage() {
        const { page } = this.state;
        if (page && page > 1) {
            this.setState({ page: page - 1});
        }
    }
    onContextMenu(e) {
        e.preventDefault();
    }
    resetScroll() {
        const ele = document.querySelector('#pdf-canvas');
        if (ele) {
            ele.scrollIntoView();
        }
    }
    onKeyDown(e) {
        if (e.keyCode === 37) {
            this.decPage();
            this.resetScroll();
        } else if (e.keyCode === 39) {
            this.incPage();
            this.resetScroll();
        }
    }
    onChange(page) {
        this.setState({ page });
        this.resetScroll();
    }
    renderDoc() {
        const { doc, page } = this.state;
        if (doc) {
            doc.getPage(page).then(img => {
                const container = document.getElementById('pdf-container');
                let viewport = img.getViewport(1);
                const scaleH = container.clientHeight / viewport.height;
                const scaleW = container.clientWidth / viewport.width;
                const ratio = container.clientHeight / container.clientWidth;
                viewport = ratio > 1 ?
                    img.getViewport(scaleW) : img.getViewport(scaleW * 0.8);
                const canvas = document.getElementById('pdf-canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if (window.devicePixelRatio > 1) {
                    const canvasWidth = canvas.width;
                    const canvasHeight = canvas.height;
                    canvas.width = canvasWidth * window.devicePixelRatio;
                    canvas.height = canvasHeight * window.devicePixelRatio;
                    canvas.style.width = `${canvasWidth}px`;
                    canvas.style.height = `${canvasHeight}px`;
                    context.scale(
                        window.devicePixelRatio, window.devicePixelRatio
                    );
                }
                const renderContext = {
                    canvasContext: context,
                    viewport,
                };
                img.render(renderContext);
            });
        }
    }
    render() {
        const { doc={}, page, err } = this.state;
        const content = !err ? (
            <div
                id="pdf-container"
                className="main"
                tabIndex="0"
                onKeyDown={this.onKeyDown}
                ref={ref => { this.container = ref; }}
            >
                <Affix
                    target={() => this.container}
                    offsetTop={0}
                    id="pdf-pagination"
                >
                    <Pagination
                        simple
                        pageSize={1}
                        current={page || 1}
                        total={doc.numPages || 1}
                        onChange={this.onChange}
                    />
                </Affix>
                <canvas
                    id="pdf-canvas"
                    onContextMenu={this.onContextMenu}
                />
            </div>
        ) : (
            <img style={{ width: '100%' }} src={this.props.src}/>
        );
        return content;
    }
}
