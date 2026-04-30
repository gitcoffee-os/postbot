import { Readability } from "@mozilla/readability";

import { state } from "~contents/components/postbot.data";

import { getImgElements } from "~media/handler/image.handler";

import { defaultReader } from "./default.reader";

const readers = {
    'default': defaultReader,
};

const readerContent = () => {
    let contentData = {
        title: '',
        content: '',
        contentImages: []
    };
    try {
        const documentClone = document.cloneNode(true);
        const postbotContainer = documentClone.getElementById('postbot-container');
        if (postbotContainer) {
            postbotContainer.remove();
        }
        const readability = new Readability(documentClone);
        const parsedData = readability.parse();
        if (parsedData) {
            contentData = parsedData;
        }
    } catch (e) {
        // Silent error handling
    }
    return contentData;
}

const readerSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedHTML = range.cloneContents();
        return selectedHTML;
    }
    return null;
}

const mergeData = (data, readerContent) => {
    if (readerContent.title) {
        data.title = readerContent.title;
    }
    if (readerContent.content) {
        data.content = readerContent.content;
    }
    if (readerContent.contentImages) {
        data.contentImages = readerContent.contentImages;
    }
}

export const reader = () => {
    let contentElements = null;
    const rangType = state.rangType;

    let data = {
        title: '',
        content: '',
        contentImages: [],
    };
    let contentImages = [];

    const readabilityData = readerContent();

    if (readabilityData && readabilityData.content) {
        data = readabilityData;
    }

    const selectionElements = readerSelection();
    if (selectionElements && selectionElements.textContent) {
        const docFragment = selectionElements;
        const serializer = new XMLSerializer();
        const htmlContent = serializer.serializeToString(docFragment);

        data.content = htmlContent;
    } else {
        const domain = window.location.hostname;
        const hasCustomReader = readers[domain] && readers[domain] !== readers['default'];

        if (hasCustomReader) {
            const reader = readers[domain];
            const readerContent = reader();
            mergeData(data, readerContent);
        } else if (!data.content) {
            const reader = readers['default'];
            if (reader) {
                const readerContent = reader();
                mergeData(data, readerContent);
            }
        }
    }

    const imgElements = getImgElements();
    if (imgElements && imgElements.length > 0) {
        contentImages = imgElements;
    }

    if (data.contentImages && data.contentImages.length > 0) {
        contentImages = data.contentImages;
    }

    return {
        title: data.title,
        content: data.content,
        contentImages: contentImages,
    };
}
