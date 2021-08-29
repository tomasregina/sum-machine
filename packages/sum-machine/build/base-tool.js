/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
/**
 * Brands a function as a directive factory function so that lit-html will call
 * the function during template rendering, rather than passing as a value.
 *
 * A _directive_ is a function that takes a Part as an argument. It has the
 * signature: `(part: Part) => void`.
 *
 * A directive _factory_ is a function that takes arguments for data and
 * configuration and returns a directive. Users of directive usually refer to
 * the directive factory as the directive. For example, "The repeat directive".
 *
 * Usually a template author will invoke a directive factory in their template
 * with relevant arguments, which will then return a directive function.
 *
 * Here's an example of using the `repeat()` directive factory that takes an
 * array and a function to render an item:
 *
 * ```js
 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
 * ```
 *
 * When `repeat` is invoked, it returns a directive function that closes over
 * `items` and the template function. When the outer template is rendered, the
 * return directive function is called with the Part for the expression.
 * `repeat` then performs it's custom logic to render multiple items.
 *
 * @param f The directive factory function. Must be a function that returns a
 * function of the signature `(part: Part) => void`. The returned function will
 * be called with the part object.
 *
 * @example
 *
 * import {directive, html} from 'lit-html';
 *
 * const immutable = directive((v) => (part) => {
 *   if (part.value !== v) {
 *     part.setValue(v)
 *   }
 * });
 */
const directive = (f) => ((...args) => {
    const d = f(...args);
    directives.set(d, true);
    return d;
});
const isDirective = (o) => {
    return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = typeof window !== 'undefined' &&
    window.customElements != null &&
    window.customElements.polyfillWrapFlushCallback !==
        undefined;
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */
const removeNodes = (container, start, end = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */
const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */
const boundAttributeSuffix = '$lit$';
/**
 * An updatable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings, values: { length } } = result;
        while (partIndex < length) {
            const node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length } = attributes;
                    // Per
                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                    // attributes are not guaranteed to be returned in document order.
                    // In particular, Edge/IE can return them out of order, so we cannot
                    // assume a correspondence between part index and attribute index.
                    let count = 0;
                    for (let i = 0; i < length; i++) {
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while (count-- > 0) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute
                        const stringForPart = strings[partIndex];
                        // Find the attribute name
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        // Find the corresponding attribute
                        // All bound attributes have had a suffix added in
                        // TemplateResult#getHTML to opt out of special attribute
                        // handling. To look up the attribute value we also need to add
                        // the suffix.
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({ type: 'attribute', index, name, strings: statics });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        let insert;
                        let s = strings[i];
                        if (s === '') {
                            insert = createMarker();
                        }
                        else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] +
                                    match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({ type: 'node', index: ++index });
                    }
                    // If there's no text, we must insert a comment to mark our place.
                    // Else, we can trust it will stick around after cloning.
                    if (strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    }
                    else {
                        node.data = strings[lastIndex];
                    }
                    // We have a part for each match found
                    partIndex += lastIndex;
                }
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of
                    // the following are true:
                    //  * We don't have a previousSibling
                    //  * The previousSibling is already the start of a previous part
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({ type: 'node', index });
                    // If we don't have a nextSibling, keep this node so we have an end.
                    // Else, we can remove it to save future costs.
                    if (node.nextSibling === null) {
                        node.data = '';
                    }
                    else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                }
                else {
                    let i = -1;
                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        // TODO (justinfagnani): consider whether it's even worth it to
                        // make bindings in comments work
                        this.parts.push({ type: 'node', index: -1 });
                        partIndex++;
                    }
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = (part) => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex = 
// eslint-disable-next-line no-control-regex
/([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari does not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            }
            else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */
const policy = window.trustedTypes &&
    trustedTypes.createPolicy('lit-html', { createHTML: (s) => s });
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment position.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            const commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            }
            else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                    attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                    marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        let value = this.getHTML();
        if (policy !== undefined) {
            // this is secure because `this.strings` is a TemplateStringsArray.
            // TODO: validate this when
            // https://github.com/tc39/proposal-array-is-template-object is
            // implemented.
            value = policy.createHTML(value);
        }
        template.innerHTML = value;
        return template;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive$1 = (value) => {
    return (value === null ||
        !(typeof value === 'object' || typeof value === 'function'));
};
const isIterable = (value) => {
    return Array.isArray(value) ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attribute. The value is only set once even if there are multiple parts
 * for an attribute.
 */
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        const parts = this.parts;
        // If we're assigning an attribute via syntax like:
        //    attr="${foo}"  or  attr=${foo}
        // but not
        //    attr="${foo} ${bar}" or attr="${foo} baz"
        // then we don't want to coerce the attribute value into one long
        // string. Instead we want to just return the value itself directly,
        // so that sanitizeDOMValue can get the actual value rather than
        // String(value)
        // The exception is if v is an array, in which case we do want to smash
        // it together into a string without calling String() on the array.
        //
        // This also allows trusted values (when using TrustedTypes) being
        // assigned to DOM sinks without being stringified in the process.
        if (l === 1 && strings[0] === '' && strings[1] === '') {
            const v = parts[0].value;
            if (typeof v === 'symbol') {
                return String(v);
            }
            if (typeof v === 'string' || !isIterable(v)) {
                return v;
            }
        }
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (isPrimitive$1(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                }
                else {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
/**
 * A Part that controls all or part of an attribute value.
 */
class AttributePart {
    constructor(committer) {
        this.value = undefined;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive$1(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */
class NodePart {
    constructor(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        if (this.startNode.parentNode === null) {
            return;
        }
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive$1(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this.__commitNode(value);
        }
        else if (isIterable(value)) {
            this.__commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling &&
            node.nodeType === 3 /* Node.TEXT_NODE */) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
        }
        else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance &&
            this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    }
}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single =
            (strings.length === 2 && strings[0] === '' && strings[1] === '');
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the third
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
// Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
// blocks right into the body of a module
(() => {
    try {
        const options = {
            get capture() {
                eventOptionsSupported = true;
                return false;
            }
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.addEventListener('test', options, options);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.removeEventListener('test', options, options);
    }
    catch (_e) {
        // event options not supported
    }
})();
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    }
}
// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions = (o) => o &&
    (eventOptionsSupported ?
        { capture: o.capture, passive: o.passive, once: o.once } :
        o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */
class DefaultTemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the event, attribute
     * name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name
     * @param strings The string literals. There are always at least two strings,
     *   event for fully-controlled bindings with a single expression.
     */
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer = new PropertyCommitter(element, name.slice(1), strings);
            return committer.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const key = result.strings.join(marker);
    // Check if we already have a Template for this key
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new Template(result, result.getTemplateElement());
        // Cache the Template for this key
        templateCache.keyString.set(key, template);
    }
    // Cache all future queries for this TemplateStringsArray
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
const render = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
if (typeof window !== 'undefined') {
    (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.3.0');
}
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
var _a$1;
/**
 * Use this module if you want to create your own base class extending
 * [[UpdatingElement]].
 * @packageDocumentation
 */
/*
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
window.JSCompiler_renameProperty =
    (prop, _obj) => prop;
const defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value ? '' : null;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                return value == null ? value : JSON.stringify(value);
        }
        return value;
    },
    fromAttribute(value, type) {
        switch (type) {
            case Boolean:
                return value !== null;
            case Number:
                return value === null ? null : Number(value);
            case Object:
            case Array:
                return JSON.parse(value);
        }
        return value;
    }
};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => {
    // This ensures (old==NaN, value==NaN) always returns false
    return old !== value && (old === old || value === value);
};
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    hasChanged: notEqual
};
const STATE_HAS_UPDATED = 1;
const STATE_UPDATE_REQUESTED = 1 << 2;
const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
/**
 * The Closure JS Compiler doesn't currently have good support for static
 * property semantics where "this" is dynamic (e.g.
 * https://github.com/google/closure-compiler/issues/3177 and others) so we use
 * this hack to bypass any rewriting by the compiler.
 */
const finalized = 'finalized';
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclassers to render updates as desired.
 * @noInheritDoc
 */
class UpdatingElement extends HTMLElement {
    constructor() {
        super();
        this.initialize();
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     */
    static get observedAttributes() {
        // note: piggy backing on this to ensure we're finalized.
        this.finalize();
        const attributes = [];
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this._classProperties.forEach((v, p) => {
            const attr = this._attributeNameForProperty(p, v);
            if (attr !== undefined) {
                this._attributeToPropertyMap.set(attr, p);
                attributes.push(attr);
            }
        });
        return attributes;
    }
    /**
     * Ensures the private `_classProperties` property metadata is created.
     * In addition to `finalize` this is also called in `createProperty` to
     * ensure the `@property` decorator can add property metadata.
     */
    /** @nocollapse */
    static _ensureClassProperties() {
        // ensure private storage for property declarations.
        if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
            this._classProperties = new Map();
            // NOTE: Workaround IE11 not supporting Map constructor argument.
            const superProperties = Object.getPrototypeOf(this)._classProperties;
            if (superProperties !== undefined) {
                superProperties.forEach((v, k) => this._classProperties.set(k, v));
            }
        }
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist
     * and stores a PropertyDeclaration for the property with the given options.
     * The property setter calls the property's `hasChanged` property option
     * or uses a strict identity check to determine whether or not to request
     * an update.
     *
     * This method may be overridden to customize properties; however,
     * when doing so, it's important to call `super.createProperty` to ensure
     * the property is setup correctly. This method calls
     * `getPropertyDescriptor` internally to get a descriptor to install.
     * To customize what properties do when they are get or set, override
     * `getPropertyDescriptor`. To customize the options for a property,
     * implement `createProperty` like this:
     *
     * static createProperty(name, options) {
     *   options = Object.assign(options, {myOption: true});
     *   super.createProperty(name, options);
     * }
     *
     * @nocollapse
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // Note, since this can be called by the `@property` decorator which
        // is called before `finalize`, we ensure storage exists for property
        // metadata.
        this._ensureClassProperties();
        this._classProperties.set(name, options);
        // Do not generate an accessor if the prototype already has one, since
        // it would be lost otherwise and that would never be the user's intention;
        // Instead, we expect users to call `requestUpdate` themselves from
        // user-defined accessors. Note that if the super has an accessor we will
        // still overwrite it
        if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
            return;
        }
        const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
        const descriptor = this.getPropertyDescriptor(name, key, options);
        if (descriptor !== undefined) {
            Object.defineProperty(this.prototype, name, descriptor);
        }
    }
    /**
     * Returns a property descriptor to be defined on the given named property.
     * If no descriptor is returned, the property will not become an accessor.
     * For example,
     *
     *   class MyElement extends LitElement {
     *     static getPropertyDescriptor(name, key, options) {
     *       const defaultDescriptor =
     *           super.getPropertyDescriptor(name, key, options);
     *       const setter = defaultDescriptor.set;
     *       return {
     *         get: defaultDescriptor.get,
     *         set(value) {
     *           setter.call(this, value);
     *           // custom action.
     *         },
     *         configurable: true,
     *         enumerable: true
     *       }
     *     }
     *   }
     *
     * @nocollapse
     */
    static getPropertyDescriptor(name, key, options) {
        return {
            // tslint:disable-next-line:no-any no symbol in index
            get() {
                return this[key];
            },
            set(value) {
                const oldValue = this[name];
                this[key] = value;
                this
                    .requestUpdateInternal(name, oldValue, options);
            },
            configurable: true,
            enumerable: true
        };
    }
    /**
     * Returns the property options associated with the given property.
     * These options are defined with a PropertyDeclaration via the `properties`
     * object or the `@property` decorator and are registered in
     * `createProperty(...)`.
     *
     * Note, this method should be considered "final" and not overridden. To
     * customize the options for a given property, override `createProperty`.
     *
     * @nocollapse
     * @final
     */
    static getPropertyOptions(name) {
        return this._classProperties && this._classProperties.get(name) ||
            defaultPropertyDeclaration;
    }
    /**
     * Creates property accessors for registered properties and ensures
     * any superclasses are also finalized.
     * @nocollapse
     */
    static finalize() {
        // finalize any superclasses
        const superCtor = Object.getPrototypeOf(this);
        if (!superCtor.hasOwnProperty(finalized)) {
            superCtor.finalize();
        }
        this[finalized] = true;
        this._ensureClassProperties();
        // initialize Map populated in observedAttributes
        this._attributeToPropertyMap = new Map();
        // make any properties
        // Note, only process "own" properties since this element will inherit
        // any properties defined on the superClass, and finalization ensures
        // the entire prototype chain is finalized.
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            // support symbols in properties (IE11 does not support this)
            const propKeys = [
                ...Object.getOwnPropertyNames(props),
                ...(typeof Object.getOwnPropertySymbols === 'function') ?
                    Object.getOwnPropertySymbols(props) :
                    []
            ];
            // This for/of is ok because propKeys is an array
            for (const p of propKeys) {
                // note, use of `any` is due to TypeSript lack of support for symbol in
                // index types
                // tslint:disable-next-line:no-any no symbol in index
                this.createProperty(p, props[p]);
            }
        }
    }
    /**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */
    static _attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false ?
            undefined :
            (typeof attribute === 'string' ?
                attribute :
                (typeof name === 'string' ? name.toLowerCase() : undefined));
    }
    /**
     * Returns true if a property should request an update.
     * Called when a property value is set and uses the `hasChanged`
     * option for the property if present or a strict identity check.
     * @nocollapse
     */
    static _valueHasChanged(value, old, hasChanged = notEqual) {
        return hasChanged(value, old);
    }
    /**
     * Returns the property value for the given attribute value.
     * Called via the `attributeChangedCallback` and uses the property's
     * `converter` or `converter.fromAttribute` property option.
     * @nocollapse
     */
    static _propertyValueFromAttribute(value, options) {
        const type = options.type;
        const converter = options.converter || defaultConverter;
        const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
        return fromAttribute ? fromAttribute(value, type) : value;
    }
    /**
     * Returns the attribute value for the given property value. If this
     * returns undefined, the property will *not* be reflected to an attribute.
     * If this returns null, the attribute will be removed, otherwise the
     * attribute will be set to the value.
     * This uses the property's `reflect` and `type.toAttribute` property options.
     * @nocollapse
     */
    static _propertyValueToAttribute(value, options) {
        if (options.reflect === undefined) {
            return;
        }
        const type = options.type;
        const converter = options.converter;
        const toAttribute = converter && converter.toAttribute ||
            defaultConverter.toAttribute;
        return toAttribute(value, type);
    }
    /**
     * Performs element initialization. By default captures any pre-set values for
     * registered properties.
     */
    initialize() {
        this._updateState = 0;
        this._updatePromise =
            new Promise((res) => this._enableUpdatingResolver = res);
        this._changedProperties = new Map();
        this._saveInstanceProperties();
        // ensures first update will be caught by an early access of
        // `updateComplete`
        this.requestUpdateInternal();
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
     * (<=41), properties created for native platform properties like (`id` or
     * `name`) may not have default values set in the element constructor. On
     * these browsers native properties appear on instances and therefore their
     * default value will overwrite any element default (e.g. if the element sets
     * this.id = 'id' in the constructor, the 'id' will become '' since this is
     * the native platform default).
     */
    _saveInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        this.constructor
            ._classProperties.forEach((_v, p) => {
            if (this.hasOwnProperty(p)) {
                const value = this[p];
                delete this[p];
                if (!this._instanceProperties) {
                    this._instanceProperties = new Map();
                }
                this._instanceProperties.set(p, value);
            }
        });
    }
    /**
     * Applies previously saved instance properties.
     */
    _applyInstanceProperties() {
        // Use forEach so this works even if for/of loops are compiled to for loops
        // expecting arrays
        // tslint:disable-next-line:no-any
        this._instanceProperties.forEach((v, p) => this[p] = v);
        this._instanceProperties = undefined;
    }
    connectedCallback() {
        // Ensure first connection completes an update. Updates cannot complete
        // before connection.
        this.enableUpdating();
    }
    enableUpdating() {
        if (this._enableUpdatingResolver !== undefined) {
            this._enableUpdatingResolver();
            this._enableUpdatingResolver = undefined;
        }
    }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     */
    disconnectedCallback() {
    }
    /**
     * Synchronizes property values when attributes change.
     */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this._attributeToProperty(name, value);
        }
    }
    _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
        const ctor = this.constructor;
        const attr = ctor._attributeNameForProperty(name, options);
        if (attr !== undefined) {
            const attrValue = ctor._propertyValueToAttribute(value, options);
            // an undefined value does not change the attribute.
            if (attrValue === undefined) {
                return;
            }
            // Track if the property is being reflected to avoid
            // setting the property again via `attributeChangedCallback`. Note:
            // 1. this takes advantage of the fact that the callback is synchronous.
            // 2. will behave incorrectly if multiple attributes are in the reaction
            // stack at time of calling. However, since we process attributes
            // in `update` this should not be possible (or an extreme corner case
            // that we'd like to discover).
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
            if (attrValue == null) {
                this.removeAttribute(attr);
            }
            else {
                this.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
        }
    }
    _attributeToProperty(name, value) {
        // Use tracking info to avoid deserializing attribute value if it was
        // just set from a property setter.
        if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
            return;
        }
        const ctor = this.constructor;
        // Note, hint this as an `AttributeMap` so closure clearly understands
        // the type; it has issues with tracking types through statics
        // tslint:disable-next-line:no-unnecessary-type-assertion
        const propName = ctor._attributeToPropertyMap.get(name);
        if (propName !== undefined) {
            const options = ctor.getPropertyOptions(propName);
            // mark state reflecting
            this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
            this[propName] =
                // tslint:disable-next-line:no-any
                ctor._propertyValueFromAttribute(value, options);
            // mark state not reflecting
            this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
        }
    }
    /**
     * This protected version of `requestUpdate` does not access or return the
     * `updateComplete` promise. This promise can be overridden and is therefore
     * not free to access.
     */
    requestUpdateInternal(name, oldValue, options) {
        let shouldRequestUpdate = true;
        // If we have a property key, perform property update steps.
        if (name !== undefined) {
            const ctor = this.constructor;
            options = options || ctor.getPropertyOptions(name);
            if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                if (!this._changedProperties.has(name)) {
                    this._changedProperties.set(name, oldValue);
                }
                // Add to reflecting properties set.
                // Note, it's important that every change has a chance to add the
                // property to `_reflectingProperties`. This ensures setting
                // attribute + property reflects correctly.
                if (options.reflect === true &&
                    !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                    if (this._reflectingProperties === undefined) {
                        this._reflectingProperties = new Map();
                    }
                    this._reflectingProperties.set(name, options);
                }
            }
            else {
                // Abort the request if the property should not be considered changed.
                shouldRequestUpdate = false;
            }
        }
        if (!this._hasRequestedUpdate && shouldRequestUpdate) {
            this._updatePromise = this._enqueueUpdate();
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should
     * be called when an element should update based on some state not triggered
     * by setting a property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored. Returns the `updateComplete` Promise which is resolved
     * when the update completes.
     *
     * @param name {PropertyKey} (optional) name of requesting property
     * @param oldValue {any} (optional) old value of requesting property
     * @returns {Promise} A Promise that is resolved when the update completes.
     */
    requestUpdate(name, oldValue) {
        this.requestUpdateInternal(name, oldValue);
        return this.updateComplete;
    }
    /**
     * Sets up the element to asynchronously update.
     */
    async _enqueueUpdate() {
        this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
        try {
            // Ensure any previous update has resolved before updating.
            // This `await` also ensures that property changes are batched.
            await this._updatePromise;
        }
        catch (e) {
            // Ignore any previous errors. We only care that the previous cycle is
            // done. Any error should have been handled in the previous update.
        }
        const result = this.performUpdate();
        // If `performUpdate` returns a Promise, we await it. This is done to
        // enable coordinating updates with a scheduler. Note, the result is
        // checked to avoid delaying an additional microtask unless we need to.
        if (result != null) {
            await result;
        }
        return !this._hasRequestedUpdate;
    }
    get _hasRequestedUpdate() {
        return (this._updateState & STATE_UPDATE_REQUESTED);
    }
    get hasUpdated() {
        return (this._updateState & STATE_HAS_UPDATED);
    }
    /**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * You can override this method to change the timing of updates. If this
     * method is overridden, `super.performUpdate()` must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```
     * protected async performUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.performUpdate();
     * }
     * ```
     */
    performUpdate() {
        // Abort any update if one is not pending when this is called.
        // This can happen if `performUpdate` is called early to "flush"
        // the update.
        if (!this._hasRequestedUpdate) {
            return;
        }
        // Mixin instance properties once, if they exist.
        if (this._instanceProperties) {
            this._applyInstanceProperties();
        }
        let shouldUpdate = false;
        const changedProperties = this._changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.update(changedProperties);
            }
            else {
                this._markUpdated();
            }
        }
        catch (e) {
            // Prevent `firstUpdated` and `updated` from running when there's an
            // update exception.
            shouldUpdate = false;
            // Ensure element can accept additional updates after an exception.
            this._markUpdated();
            throw e;
        }
        if (shouldUpdate) {
            if (!(this._updateState & STATE_HAS_UPDATED)) {
                this._updateState = this._updateState | STATE_HAS_UPDATED;
                this.firstUpdated(changedProperties);
            }
            this.updated(changedProperties);
        }
    }
    _markUpdated() {
        this._changedProperties = new Map();
        this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update.
     *
     * To await additional asynchronous work, override the `_getUpdateComplete`
     * method. For example, it is sometimes useful to await a rendered element
     * before fulfilling this Promise. To do this, first await
     * `super._getUpdateComplete()`, then any subsequent state.
     *
     * @returns {Promise} The Promise returns a boolean that indicates if the
     * update resolved without triggering another update.
     */
    get updateComplete() {
        return this._getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     *   class MyElement extends LitElement {
     *     async _getUpdateComplete() {
     *       await super._getUpdateComplete();
     *       await this._myChild.updateComplete;
     *     }
     *   }
     */
    _getUpdateComplete() {
        return this._updatePromise;
    }
    /**
     * Controls whether or not `update` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    update(_changedProperties) {
        if (this._reflectingProperties !== undefined &&
            this._reflectingProperties.size > 0) {
            // Use forEach so this works even if for/of loops are compiled to for
            // loops expecting arrays
            this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
            this._reflectingProperties = undefined;
        }
        this._markUpdated();
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    updated(_changedProperties) {
    }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     */
    firstUpdated(_changedProperties) {
    }
}
_a$1 = finalized;
/**
 * Marks class as having finished creating properties.
 */
UpdatingElement[_a$1] = true;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const legacyCustomElement = (tagName, clazz) => {
    window.customElements.define(tagName, clazz);
    // Cast as any because TS doesn't recognize the return type as being a
    // subtype of the decorated class when clazz is typed as
    // `Constructor<HTMLElement>` for some reason.
    // `Constructor<HTMLElement>` is helpful to make sure the decorator is
    // applied to elements however.
    // tslint:disable-next-line:no-any
    return clazz;
};
const standardCustomElement = (tagName, descriptor) => {
    const { kind, elements } = descriptor;
    return {
        kind,
        elements,
        // This callback is called once the class is otherwise fully defined
        finisher(clazz) {
            window.customElements.define(tagName, clazz);
        }
    };
};
/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * ```
 * @customElement('my-element')
 * class MyElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 * @category Decorator
 * @param tagName The name of the custom element to define.
 */
const customElement = (tagName) => (classOrDescriptor) => (typeof classOrDescriptor === 'function') ?
    legacyCustomElement(tagName, classOrDescriptor) :
    standardCustomElement(tagName, classOrDescriptor);
const standardProperty = (options, element) => {
    // When decorating an accessor, pass it through and add property metadata.
    // Note, the `hasOwnProperty` check in `createProperty` ensures we don't
    // stomp over the user's accessor.
    if (element.kind === 'method' && element.descriptor &&
        !('value' in element.descriptor)) {
        return Object.assign(Object.assign({}, element), { finisher(clazz) {
                clazz.createProperty(element.key, options);
            } });
    }
    else {
        // createProperty() takes care of defining the property, but we still
        // must return some kind of descriptor, so return a descriptor for an
        // unused prototype field. The finisher calls createProperty().
        return {
            kind: 'field',
            key: Symbol(),
            placement: 'own',
            descriptor: {},
            // When @babel/plugin-proposal-decorators implements initializers,
            // do this instead of the initializer below. See:
            // https://github.com/babel/babel/issues/9260 extras: [
            //   {
            //     kind: 'initializer',
            //     placement: 'own',
            //     initializer: descriptor.initializer,
            //   }
            // ],
            initializer() {
                if (typeof element.initializer === 'function') {
                    this[element.key] = element.initializer.call(this);
                }
            },
            finisher(clazz) {
                clazz.createProperty(element.key, options);
            }
        };
    }
};
const legacyProperty = (options, proto, name) => {
    proto.constructor
        .createProperty(name, options);
};
/**
 * A property decorator which creates a LitElement property which reflects a
 * corresponding attribute value. A [[`PropertyDeclaration`]] may optionally be
 * supplied to configure property features.
 *
 * This decorator should only be used for public fields. Private or protected
 * fields should use the [[`internalProperty`]] decorator.
 *
 * @example
 * ```ts
 * class MyElement {
 *   @property({ type: Boolean })
 *   clicked = false;
 * }
 * ```
 * @category Decorator
 * @ExportDecoratedItems
 */
function property(options) {
    // tslint:disable-next-line:no-any decorator
    return (protoOrDescriptor, name) => (name !== undefined) ?
        legacyProperty(options, protoOrDescriptor, name) :
        standardProperty(options, protoOrDescriptor);
}
/**
 * Declares a private or protected property that still triggers updates to the
 * element when it changes.
 *
 * Properties declared this way must not be used from HTML or HTML templating
 * systems, they're solely for properties internal to the element. These
 * properties may be renamed by optimization tools like closure compiler.
 * @category Decorator
 */
function internalProperty(options) {
    return property({ attribute: false, hasChanged: options === null || options === void 0 ? void 0 : options.hasChanged });
}

/**
@license
Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at
http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
part of the polymer project is also subject to an additional IP rights grant
found at http://polymer.github.io/PATENTS.txt
*/
/**
 * Whether the current browser supports `adoptedStyleSheets`.
 */
const supportsAdoptingStyleSheets = (window.ShadowRoot) &&
    (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow) &&
    ('adoptedStyleSheets' in Document.prototype) &&
    ('replace' in CSSStyleSheet.prototype);
const constructionToken = Symbol();
class CSSResult {
    constructor(cssText, safeToken) {
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
    }
    // Note, this is a getter so that it's lazy. In practice, this means
    // stylesheets are not created until the first element instance is made.
    get styleSheet() {
        if (this._styleSheet === undefined) {
            // Note, if `supportsAdoptingStyleSheets` is true then we assume
            // CSSStyleSheet is constructable.
            if (supportsAdoptingStyleSheets) {
                this._styleSheet = new CSSStyleSheet();
                this._styleSheet.replaceSync(this.cssText);
            }
            else {
                this._styleSheet = null;
            }
        }
        return this._styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
/**
 * Wrap a value for interpolation in a [[`css`]] tagged template literal.
 *
 * This is unsafe because untrusted CSS text can be used to phone home
 * or exfiltrate data to an attacker controlled site. Take care to only use
 * this with trusted input.
 */
const unsafeCSS = (value) => {
    return new CSSResult(String(value), constructionToken);
};
const textFromCSSResult = (value) => {
    if (value instanceof CSSResult) {
        return value.cssText;
    }
    else if (typeof value === 'number') {
        return value;
    }
    else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
    }
};
/**
 * Template tag which which can be used with LitElement's [[LitElement.styles |
 * `styles`]] property to set element styles. For security reasons, only literal
 * string values may be used. To incorporate non-literal values [[`unsafeCSS`]]
 * may be used inside a template string part.
 */
const css = (strings, ...values) => {
    const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, constructionToken);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
// TODO(justinfagnani): inject version number at build time
(window['litElementVersions'] || (window['litElementVersions'] = []))
    .push('2.4.0');
/**
 * Sentinal value used to avoid calling lit-html's render function when
 * subclasses do not implement `render`
 */
const renderNotImplemented = {};
/**
 * Base element class that manages element properties and attributes, and
 * renders a lit-html template.
 *
 * To define a component, subclass `LitElement` and implement a
 * `render` method to provide the component's template. Define properties
 * using the [[`properties`]] property or the [[`property`]] decorator.
 */
class LitElement extends UpdatingElement {
    /**
     * Return the array of styles to apply to the element.
     * Override this method to integrate into a style management system.
     *
     * @nocollapse
     */
    static getStyles() {
        return this.styles;
    }
    /** @nocollapse */
    static _getUniqueStyles() {
        // Only gather styles once per class
        if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
            return;
        }
        // Take care not to call `this.getStyles()` multiple times since this
        // generates new CSSResults each time.
        // TODO(sorvell): Since we do not cache CSSResults by input, any
        // shared styles will generate new stylesheet objects, which is wasteful.
        // This should be addressed when a browser ships constructable
        // stylesheets.
        const userStyles = this.getStyles();
        if (Array.isArray(userStyles)) {
            // De-duplicate styles preserving the _last_ instance in the set.
            // This is a performance optimization to avoid duplicated styles that can
            // occur especially when composing via subclassing.
            // The last item is kept to try to preserve the cascade order with the
            // assumption that it's most important that last added styles override
            // previous styles.
            const addStyles = (styles, set) => styles.reduceRight((set, s) => 
            // Note: On IE set.add() does not return the set
            Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set);
            // Array.from does not work on Set in IE, otherwise return
            // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()
            const set = addStyles(userStyles, new Set());
            const styles = [];
            set.forEach((v) => styles.unshift(v));
            this._styles = styles;
        }
        else {
            this._styles = userStyles === undefined ? [] : [userStyles];
        }
        // Ensure that there are no invalid CSSStyleSheet instances here. They are
        // invalid in two conditions.
        // (1) the sheet is non-constructible (`sheet` of a HTMLStyleElement), but
        //     this is impossible to check except via .replaceSync or use
        // (2) the ShadyCSS polyfill is enabled (:. supportsAdoptingStyleSheets is
        //     false)
        this._styles = this._styles.map((s) => {
            if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
                // Flatten the cssText from the passed constructible stylesheet (or
                // undetectable non-constructible stylesheet). The user might have
                // expected to update their stylesheets over time, but the alternative
                // is a crash.
                const cssText = Array.prototype.slice.call(s.cssRules)
                    .reduce((css, rule) => css + rule.cssText, '');
                return unsafeCSS(cssText);
            }
            return s;
        });
    }
    /**
     * Performs element initialization. By default this calls
     * [[`createRenderRoot`]] to create the element [[`renderRoot`]] node and
     * captures any pre-set values for registered properties.
     */
    initialize() {
        super.initialize();
        this.constructor._getUniqueStyles();
        this.renderRoot = this.createRenderRoot();
        // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
        // element's getRootNode(). While this could be done, we're choosing not to
        // support this now since it would require different logic around de-duping.
        if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
            this.adoptStyles();
        }
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     * @returns {Element|DocumentFragment} Returns a node into which to render.
     */
    createRenderRoot() {
        return this.attachShadow({ mode: 'open' });
    }
    /**
     * Applies styling to the element shadowRoot using the [[`styles`]]
     * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
     * available and will fallback otherwise. When Shadow DOM is polyfilled,
     * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
     * is available but `adoptedStyleSheets` is not, styles are appended to the
     * end of the `shadowRoot` to [mimic spec
     * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
     */
    adoptStyles() {
        const styles = this.constructor._styles;
        if (styles.length === 0) {
            return;
        }
        // There are three separate cases here based on Shadow DOM support.
        // (1) shadowRoot polyfilled: use ShadyCSS
        // (2) shadowRoot.adoptedStyleSheets available: use it
        // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
        // rendering
        if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
            window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
        }
        else if (supportsAdoptingStyleSheets) {
            this.renderRoot.adoptedStyleSheets =
                styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
        }
        else {
            // This must be done after rendering so the actual style insertion is done
            // in `update`.
            this._needsShimAdoptedStyleSheets = true;
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // Note, first update/render handles styleElement so we only call this if
        // connected after first update.
        if (this.hasUpdated && window.ShadyCSS !== undefined) {
            window.ShadyCSS.styleElement(this);
        }
    }
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * @param _changedProperties Map of changed properties with old values
     */
    update(changedProperties) {
        // Setting properties in `render` should not trigger an update. Since
        // updates are allowed after super.update, it's important to call `render`
        // before that.
        const templateResult = this.render();
        super.update(changedProperties);
        // If render is not implemented by the component, don't call lit-html render
        if (templateResult !== renderNotImplemented) {
            this.constructor
                .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
        }
        // When native Shadow DOM is used but adoptedStyles are not supported,
        // insert styling after rendering to ensure adoptedStyles have highest
        // priority.
        if (this._needsShimAdoptedStyleSheets) {
            this._needsShimAdoptedStyleSheets = false;
            this.constructor._styles.forEach((s) => {
                const style = document.createElement('style');
                style.textContent = s.cssText;
                this.renderRoot.appendChild(style);
            });
        }
    }
    /**
     * Invoked on each update to perform rendering tasks. This method may return
     * any value renderable by lit-html's `NodePart` - typically a
     * `TemplateResult`. Setting properties inside this method will *not* trigger
     * the element to update.
     */
    render() {
        return renderNotImplemented;
    }
}
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See updating-element.ts for more information.
 */
LitElement['finalized'] = true;
/**
 * Reference to the underlying library method used to render the element's
 * DOM. By default, points to the `render` method from lit-html's shady-render
 * module.
 *
 * **Most users will never need to touch this property.**
 *
 * This  property should not be confused with the `render` instance method,
 * which should be overridden to define a template for the element.
 *
 * Advanced users creating a new base class based on LitElement can override
 * this property to point to a custom render method with a signature that
 * matches [shady-render's `render`
 * method](https://lit-html.polymer-project.org/api/modules/shady_render.html#render).
 *
 * @nocollapse
 */
LitElement.render = render;

class Deferred {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}

class AssetService {
    constructor(assetPath, baseAssetPath = null) {
        const reTrimSlashes = new RegExp('[\\/]+$', 'g');
        // Store asset path without trailing slash(es)
        this.assetPath = (assetPath || '').replace(reTrimSlashes, '');
        if (baseAssetPath) {
            reTrimSlashes.lastIndex = 0;
            this.baseAssetPath = (baseAssetPath !== null && baseAssetPath !== void 0 ? baseAssetPath : '').replace(reTrimSlashes, '');
        }
    }
    getAssetPath(relativePath) {
        return `${this.assetPath}/${relativePath}`;
    }
    getBaseAssetPath(relativePath) {
        return `${this.baseAssetPath}/${relativePath}`;
    }
    static getRootAssetService(element) {
        if (!element) {
            return null;
        }
        let elt = element;
        while (elt) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (elt.assetService) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return elt.assetService;
            }
            if (elt instanceof ShadowRoot) {
                elt = elt.host;
            }
            else {
                elt = elt.getRootNode();
            }
            // Top reached
            if (elt instanceof Document) {
                break;
            }
        }
        return null;
    }
}

class AudioService {
    /**
     * Play a list of audio URLs.
     *
     * @param customElement Root element.
     * @param urls Absolute URLs of files to play.
     * @param options Options object.
     */
    static playAudioUrls(customElement, urls, options = { replay: true }) {
        const event = new CustomEvent('playAudio', {
            detail: {
                urls,
                options,
            },
        });
        customElement.dispatchEvent(event);
    }
}

/* eslint-disable no-unused-vars */
var Icons;
(function (Icons) {
    Icons["POINT_DOWN"] = "point_down";
    Icons["POINT_UP"] = "point_up";
    Icons["POINT_LEFT"] = "point_left";
    Icons["POINT_RIGHT"] = "point_right";
    Icons["SETTINGS"] = "settings";
    Icons["RETRY"] = "retry";
    Icons["PLAY_BUTTON"] = "play_button";
    Icons["MINUS"] = "minus";
    Icons["PLUS"] = "plus";
    Icons["RANDOMIZE"] = "randomize";
    Icons["TRASH"] = "trash";
    Icons["VIEW"] = "view";
    Icons["VIEW_ALT"] = "view-alt";
    Icons["HIDE"] = "hide";
    Icons["HIDE_ALT"] = "hide-alt";
    Icons["CLEAR_INPUT"] = "clear_input";
    Icons["COPY_PASTE"] = "copy_paste";
    Icons["QR_CODE"] = "qr-code";
    Icons["DICE_THROW"] = "dice_throw";
    Icons["ADD"] = "add";
    Icons["CALCULATE"] = "calculate";
    Icons["SORT"] = "sort";
})(Icons || (Icons = {}));
var Environments;
(function (Environments) {
    Environments["TOOL"] = "tool";
    Environments["SETTINGS"] = "settings";
})(Environments || (Environments = {}));
var ButtonSizes;
(function (ButtonSizes) {
    ButtonSizes["SMALL"] = "small";
    ButtonSizes["MEDIUM"] = "medium";
    ButtonSizes["LARGE"] = "large";
})(ButtonSizes || (ButtonSizes = {}));
var ButtonColors;
(function (ButtonColors) {
    ButtonColors["PRIMARY"] = "primary";
    ButtonColors["SECONDARY"] = "secondary";
    ButtonColors["LIGHT"] = "light";
    ButtonColors["SHUTTLE_GRAY"] = "shuttle-gray";
    ButtonColors["SOLITUDE"] = "solitude";
    ButtonColors["NEGATIVE"] = "negative";
})(ButtonColors || (ButtonColors = {}));
var ButtonOrientations;
(function (ButtonOrientations) {
    ButtonOrientations["HORIZONTAL"] = "horizontal";
    ButtonOrientations["VERTICAL"] = "vertical";
})(ButtonOrientations || (ButtonOrientations = {}));
var LoadingStatus;
(function (LoadingStatus) {
    LoadingStatus["NONE"] = "none";
    LoadingStatus["LOADING"] = "loading";
    LoadingStatus["LOADED"] = "loaded";
})(LoadingStatus || (LoadingStatus = {}));
var ToolTipPlacement;
(function (ToolTipPlacement) {
    ToolTipPlacement["BOTTOM"] = "bottom";
    ToolTipPlacement["TOP"] = "top";
})(ToolTipPlacement || (ToolTipPlacement = {}));
var DropdownPositions;
(function (DropdownPositions) {
    DropdownPositions["AUTO"] = "auto";
    DropdownPositions["TOP"] = "top";
    DropdownPositions["BOTTOM"] = "bottom";
})(DropdownPositions || (DropdownPositions = {}));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign$2 = function() {
    __assign$2 = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || from);
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign$1 = function() {
    __assign$1 = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};

var ErrorKind;
(function (ErrorKind) {
    /** Argument is unclosed (e.g. `{0`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
    /** Argument is empty (e.g. `{}`). */
    ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
    /** Argument is malformed (e.g. `{foo!}``) */
    ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
    /** Expect an argument type (e.g. `{foo,}`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
    /** Unsupported argument type (e.g. `{foo,foo}`) */
    ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
    /** Expect an argument style (e.g. `{foo, number, }`) */
    ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
    /** The number skeleton is invalid. */
    ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
    /** The date time skeleton is invalid. */
    ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
    /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */
    ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
    /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */
    ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
    /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */
    ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
    /** Missing select argument options (e.g. `{foo, select}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
    /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
    /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */
    ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
    /** Expecting a selector in `select` argument (e.g `{foo, select}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
    /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
    /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */
    ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
    /**
     * Expecting a message fragment after the `plural` or `selectordinal` selector
     * (e.g. `{foo, plural, one}`)
     */
    ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
    /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */
    ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
    /**
     * Duplicate selectors in `plural` or `selectordinal` argument.
     * (e.g. {foo, plural, one {#} one {#}})
     */
    ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
    /** Duplicate selectors in `select` argument.
     * (e.g. {foo, select, apple {apple} apple {apple}})
     */
    ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
    /** Plural or select argument option must have `other` clause. */
    ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
    /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */
    ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
    /** The tag name is invalid. (e.g. `<123>foo</123>`) */
    ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
    /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */
    ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
    /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */
    ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
})(ErrorKind || (ErrorKind = {}));

var TYPE;
(function (TYPE) {
    /**
     * Raw text
     */
    TYPE[TYPE["literal"] = 0] = "literal";
    /**
     * Variable w/o any format, e.g `var` in `this is a {var}`
     */
    TYPE[TYPE["argument"] = 1] = "argument";
    /**
     * Variable w/ number format
     */
    TYPE[TYPE["number"] = 2] = "number";
    /**
     * Variable w/ date format
     */
    TYPE[TYPE["date"] = 3] = "date";
    /**
     * Variable w/ time format
     */
    TYPE[TYPE["time"] = 4] = "time";
    /**
     * Variable w/ select format
     */
    TYPE[TYPE["select"] = 5] = "select";
    /**
     * Variable w/ plural format
     */
    TYPE[TYPE["plural"] = 6] = "plural";
    /**
     * Only possible within plural argument.
     * This is the `#` symbol that will be substituted with the count.
     */
    TYPE[TYPE["pound"] = 7] = "pound";
    /**
     * XML-like tag
     */
    TYPE[TYPE["tag"] = 8] = "tag";
})(TYPE || (TYPE = {}));
var SKELETON_TYPE;
(function (SKELETON_TYPE) {
    SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
    SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
})(SKELETON_TYPE || (SKELETON_TYPE = {}));
/**
 * Type Guards
 */
function isLiteralElement(el) {
    return el.type === TYPE.literal;
}
function isArgumentElement(el) {
    return el.type === TYPE.argument;
}
function isNumberElement(el) {
    return el.type === TYPE.number;
}
function isDateElement(el) {
    return el.type === TYPE.date;
}
function isTimeElement(el) {
    return el.type === TYPE.time;
}
function isSelectElement(el) {
    return el.type === TYPE.select;
}
function isPluralElement(el) {
    return el.type === TYPE.plural;
}
function isPoundElement(el) {
    return el.type === TYPE.pound;
}
function isTagElement(el) {
    return el.type === TYPE.tag;
}
function isNumberSkeleton(el) {
    return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
}
function isDateTimeSkeleton(el) {
    return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
}

// @generated from regex-gen.ts
var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

/**
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
 * with some tweaks
 */
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */
function parseDateTimeSkeleton(skeleton) {
    var result = {};
    skeleton.replace(DATE_TIME_REGEX, function (match) {
        var len = match.length;
        switch (match[0]) {
            // Era
            case 'G':
                result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
                break;
            // Year
            case 'y':
                result.year = len === 2 ? '2-digit' : 'numeric';
                break;
            case 'Y':
            case 'u':
            case 'U':
            case 'r':
                throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
            // Quarter
            case 'q':
            case 'Q':
                throw new RangeError('`q/Q` (quarter) patterns are not supported');
            // Month
            case 'M':
            case 'L':
                result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
                break;
            // Week
            case 'w':
            case 'W':
                throw new RangeError('`w/W` (week) patterns are not supported');
            case 'd':
                result.day = ['numeric', '2-digit'][len - 1];
                break;
            case 'D':
            case 'F':
            case 'g':
                throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
            // Weekday
            case 'E':
                result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
                break;
            case 'e':
                if (len < 4) {
                    throw new RangeError('`e..eee` (weekday) patterns are not supported');
                }
                result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                break;
            case 'c':
                if (len < 4) {
                    throw new RangeError('`c..ccc` (weekday) patterns are not supported');
                }
                result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                break;
            // Period
            case 'a': // AM, PM
                result.hour12 = true;
                break;
            case 'b': // am, pm, noon, midnight
            case 'B': // flexible day periods
                throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
            // Hour
            case 'h':
                result.hourCycle = 'h12';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'H':
                result.hourCycle = 'h23';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'K':
                result.hourCycle = 'h11';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'k':
                result.hourCycle = 'h24';
                result.hour = ['numeric', '2-digit'][len - 1];
                break;
            case 'j':
            case 'J':
            case 'C':
                throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
            // Minute
            case 'm':
                result.minute = ['numeric', '2-digit'][len - 1];
                break;
            // Second
            case 's':
                result.second = ['numeric', '2-digit'][len - 1];
                break;
            case 'S':
            case 'A':
                throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
            // Zone
            case 'z': // 1..3, 4: specific non-location format
                result.timeZoneName = len < 4 ? 'short' : 'long';
                break;
            case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
            case 'O': // 1, 4: miliseconds in day short, long
            case 'v': // 1, 4: generic non-location format
            case 'V': // 1, 2, 3, 4: time zone ID or city
            case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
            case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
                throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
        }
        return '';
    });
    return result;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

// @generated from regex-gen.ts
var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;

function parseNumberSkeletonFromString(skeleton) {
    if (skeleton.length === 0) {
        throw new Error('Number skeleton cannot be empty');
    }
    // Parse the skeleton
    var stringTokens = skeleton
        .split(WHITE_SPACE_REGEX)
        .filter(function (x) { return x.length > 0; });
    var tokens = [];
    for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
        var stringToken = stringTokens_1[_i];
        var stemAndOptions = stringToken.split('/');
        if (stemAndOptions.length === 0) {
            throw new Error('Invalid number skeleton');
        }
        var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
        for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
            var option = options_1[_a];
            if (option.length === 0) {
                throw new Error('Invalid number skeleton');
            }
        }
        tokens.push({ stem: stem, options: options });
    }
    return tokens;
}
function icuUnitToEcma(unit) {
    return unit.replace(/^(.*?)-/, '');
}
var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?$/g;
var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
function parseSignificantPrecision(str) {
    var result = {};
    str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
        // @@@ case
        if (typeof g2 !== 'string') {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits = g1.length;
        }
        // @@@+ case
        else if (g2 === '+') {
            result.minimumSignificantDigits = g1.length;
        }
        // .### case
        else if (g1[0] === '#') {
            result.maximumSignificantDigits = g1.length;
        }
        // .@@## or .@@@ case
        else {
            result.minimumSignificantDigits = g1.length;
            result.maximumSignificantDigits =
                g1.length + (typeof g2 === 'string' ? g2.length : 0);
        }
        return '';
    });
    return result;
}
function parseSign(str) {
    switch (str) {
        case 'sign-auto':
            return {
                signDisplay: 'auto',
            };
        case 'sign-accounting':
        case '()':
            return {
                currencySign: 'accounting',
            };
        case 'sign-always':
        case '+!':
            return {
                signDisplay: 'always',
            };
        case 'sign-accounting-always':
        case '()!':
            return {
                signDisplay: 'always',
                currencySign: 'accounting',
            };
        case 'sign-except-zero':
        case '+?':
            return {
                signDisplay: 'exceptZero',
            };
        case 'sign-accounting-except-zero':
        case '()?':
            return {
                signDisplay: 'exceptZero',
                currencySign: 'accounting',
            };
        case 'sign-never':
        case '+_':
            return {
                signDisplay: 'never',
            };
    }
}
function parseConciseScientificAndEngineeringStem(stem) {
    // Engineering
    var result;
    if (stem[0] === 'E' && stem[1] === 'E') {
        result = {
            notation: 'engineering',
        };
        stem = stem.slice(2);
    }
    else if (stem[0] === 'E') {
        result = {
            notation: 'scientific',
        };
        stem = stem.slice(1);
    }
    if (result) {
        var signDisplay = stem.slice(0, 2);
        if (signDisplay === '+!') {
            result.signDisplay = 'always';
            stem = stem.slice(2);
        }
        else if (signDisplay === '+?') {
            result.signDisplay = 'exceptZero';
            stem = stem.slice(2);
        }
        if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
            throw new Error('Malformed concise eng/scientific notation');
        }
        result.minimumIntegerDigits = stem.length;
    }
    return result;
}
function parseNotationOptions(opt) {
    var result = {};
    var signOpts = parseSign(opt);
    if (signOpts) {
        return signOpts;
    }
    return result;
}
/**
 * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
 */
function parseNumberSkeleton(tokens) {
    var result = {};
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        switch (token.stem) {
            case 'percent':
            case '%':
                result.style = 'percent';
                continue;
            case '%x100':
                result.style = 'percent';
                result.scale = 100;
                continue;
            case 'currency':
                result.style = 'currency';
                result.currency = token.options[0];
                continue;
            case 'group-off':
            case ',_':
                result.useGrouping = false;
                continue;
            case 'precision-integer':
            case '.':
                result.maximumFractionDigits = 0;
                continue;
            case 'measure-unit':
            case 'unit':
                result.style = 'unit';
                result.unit = icuUnitToEcma(token.options[0]);
                continue;
            case 'compact-short':
            case 'K':
                result.notation = 'compact';
                result.compactDisplay = 'short';
                continue;
            case 'compact-long':
            case 'KK':
                result.notation = 'compact';
                result.compactDisplay = 'long';
                continue;
            case 'scientific':
                result = __assign(__assign(__assign({}, result), { notation: 'scientific' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                continue;
            case 'engineering':
                result = __assign(__assign(__assign({}, result), { notation: 'engineering' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                continue;
            case 'notation-simple':
                result.notation = 'standard';
                continue;
            // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
            case 'unit-width-narrow':
                result.currencyDisplay = 'narrowSymbol';
                result.unitDisplay = 'narrow';
                continue;
            case 'unit-width-short':
                result.currencyDisplay = 'code';
                result.unitDisplay = 'short';
                continue;
            case 'unit-width-full-name':
                result.currencyDisplay = 'name';
                result.unitDisplay = 'long';
                continue;
            case 'unit-width-iso-code':
                result.currencyDisplay = 'symbol';
                continue;
            case 'scale':
                result.scale = parseFloat(token.options[0]);
                continue;
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
            case 'integer-width':
                if (token.options.length > 1) {
                    throw new RangeError('integer-width stems only accept a single optional option');
                }
                token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
                    if (g1) {
                        result.minimumIntegerDigits = g2.length;
                    }
                    else if (g3 && g4) {
                        throw new Error('We currently do not support maximum integer digits');
                    }
                    else if (g5) {
                        throw new Error('We currently do not support exact integer digits');
                    }
                    return '';
                });
                continue;
        }
        // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
        if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
            result.minimumIntegerDigits = token.stem.length;
            continue;
        }
        if (FRACTION_PRECISION_REGEX.test(token.stem)) {
            // Precision
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
            // precision-integer case
            if (token.options.length > 1) {
                throw new RangeError('Fraction-precision stems only accept a single optional option');
            }
            token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
                // .000* case (before ICU67 it was .000+)
                if (g2 === '*') {
                    result.minimumFractionDigits = g1.length;
                }
                // .### case
                else if (g3 && g3[0] === '#') {
                    result.maximumFractionDigits = g3.length;
                }
                // .00## case
                else if (g4 && g5) {
                    result.minimumFractionDigits = g4.length;
                    result.maximumFractionDigits = g4.length + g5.length;
                }
                else {
                    result.minimumFractionDigits = g1.length;
                    result.maximumFractionDigits = g1.length;
                }
                return '';
            });
            if (token.options.length) {
                result = __assign(__assign({}, result), parseSignificantPrecision(token.options[0]));
            }
            continue;
        }
        // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision
        if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
            result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
            continue;
        }
        var signOpts = parseSign(token.stem);
        if (signOpts) {
            result = __assign(__assign({}, result), signOpts);
        }
        var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
        if (conciseScientificAndEngineeringOpts) {
            result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
        }
    }
    return result;
}

var _a;
var SPACE_SEPARATOR_START_REGEX = new RegExp("^" + SPACE_SEPARATOR_REGEX.source + "*");
var SPACE_SEPARATOR_END_REGEX = new RegExp(SPACE_SEPARATOR_REGEX.source + "*$");
function createLocation(start, end) {
    return { start: start, end: end };
}
// #region Ponyfills
// Consolidate these variables up top for easier toggling during debugging
var hasNativeStartsWith = !!String.prototype.startsWith;
var hasNativeFromCodePoint = !!String.fromCodePoint;
var hasNativeFromEntries = !!Object.fromEntries;
var hasNativeCodePointAt = !!String.prototype.codePointAt;
var hasTrimStart = !!String.prototype.trimStart;
var hasTrimEnd = !!String.prototype.trimEnd;
var hasNativeIsSafeInteger = !!Number.isSafeInteger;
var isSafeInteger = hasNativeIsSafeInteger
    ? Number.isSafeInteger
    : function (n) {
        return (typeof n === 'number' &&
            isFinite(n) &&
            Math.floor(n) === n &&
            Math.abs(n) <= 0x1fffffffffffff);
    };
// IE11 does not support y and u.
var REGEX_SUPPORTS_U_AND_Y = true;
try {
    var re = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
    /**
     * legacy Edge or Xbox One browser
     * Unicode flag support: supported
     * Pattern_Syntax support: not supported
     * See https://github.com/formatjs/formatjs/issues/2822
     */
    REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec('a')) === null || _a === void 0 ? void 0 : _a[0]) === 'a';
}
catch (_) {
    REGEX_SUPPORTS_U_AND_Y = false;
}
var startsWith = hasNativeStartsWith
    ? // Native
        function startsWith(s, search, position) {
            return s.startsWith(search, position);
        }
    : // For IE11
        function startsWith(s, search, position) {
            return s.slice(position, position + search.length) === search;
        };
var fromCodePoint = hasNativeFromCodePoint
    ? String.fromCodePoint
    : // IE11
        function fromCodePoint() {
            var codePoints = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                codePoints[_i] = arguments[_i];
            }
            var elements = '';
            var length = codePoints.length;
            var i = 0;
            var code;
            while (length > i) {
                code = codePoints[i++];
                if (code > 0x10ffff)
                    throw RangeError(code + ' is not a valid code point');
                elements +=
                    code < 0x10000
                        ? String.fromCharCode(code)
                        : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, (code % 0x400) + 0xdc00);
            }
            return elements;
        };
var fromEntries = 
// native
hasNativeFromEntries
    ? Object.fromEntries
    : // Ponyfill
        function fromEntries(entries) {
            var obj = {};
            for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                var _a = entries_1[_i], k = _a[0], v = _a[1];
                obj[k] = v;
            }
            return obj;
        };
var codePointAt = hasNativeCodePointAt
    ? // Native
        function codePointAt(s, index) {
            return s.codePointAt(index);
        }
    : // IE 11
        function codePointAt(s, index) {
            var size = s.length;
            if (index < 0 || index >= size) {
                return undefined;
            }
            var first = s.charCodeAt(index);
            var second;
            return first < 0xd800 ||
                first > 0xdbff ||
                index + 1 === size ||
                (second = s.charCodeAt(index + 1)) < 0xdc00 ||
                second > 0xdfff
                ? first
                : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
        };
var trimStart = hasTrimStart
    ? // Native
        function trimStart(s) {
            return s.trimStart();
        }
    : // Ponyfill
        function trimStart(s) {
            return s.replace(SPACE_SEPARATOR_START_REGEX, '');
        };
var trimEnd = hasTrimEnd
    ? // Native
        function trimEnd(s) {
            return s.trimEnd();
        }
    : // Ponyfill
        function trimEnd(s) {
            return s.replace(SPACE_SEPARATOR_END_REGEX, '');
        };
// Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.
function RE(s, flag) {
    return new RegExp(s, flag);
}
// #endregion
var matchIdentifierAtIndex;
if (REGEX_SUPPORTS_U_AND_Y) {
    // Native
    var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
    matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
        var _a;
        IDENTIFIER_PREFIX_RE_1.lastIndex = index;
        var match = IDENTIFIER_PREFIX_RE_1.exec(s);
        return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
    };
}
else {
    // IE11
    matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
        var match = [];
        while (true) {
            var c = codePointAt(s, index);
            if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
                break;
            }
            match.push(c);
            index += c >= 0x10000 ? 2 : 1;
        }
        return fromCodePoint.apply(void 0, match);
    };
}
var Parser = /** @class */ (function () {
    function Parser(message, options) {
        if (options === void 0) { options = {}; }
        this.message = message;
        this.position = { offset: 0, line: 1, column: 1 };
        this.ignoreTag = !!options.ignoreTag;
        this.requiresOtherClause = !!options.requiresOtherClause;
        this.shouldParseSkeletons = !!options.shouldParseSkeletons;
    }
    Parser.prototype.parse = function () {
        if (this.offset() !== 0) {
            throw Error('parser can only be used once');
        }
        return this.parseMessage(0, '', false);
    };
    Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
        var elements = [];
        while (!this.isEOF()) {
            var char = this.char();
            if (char === 123 /* `{` */) {
                var result = this.parseArgument(nestingLevel, expectingCloseTag);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
            else if (char === 125 /* `}` */ && nestingLevel > 0) {
                break;
            }
            else if (char === 35 /* `#` */ &&
                (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
                var position = this.clonePosition();
                this.bump();
                elements.push({
                    type: TYPE.pound,
                    location: createLocation(position, this.clonePosition()),
                });
            }
            else if (char === 60 /* `<` */ &&
                !this.ignoreTag &&
                this.peek() === 47 // char code for '/'
            ) {
                if (expectingCloseTag) {
                    break;
                }
                else {
                    return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
                }
            }
            else if (char === 60 /* `<` */ &&
                !this.ignoreTag &&
                _isAlpha(this.peek() || 0)) {
                var result = this.parseTag(nestingLevel, parentArgType);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
            else {
                var result = this.parseLiteral(nestingLevel, parentArgType);
                if (result.err) {
                    return result;
                }
                elements.push(result.val);
            }
        }
        return { val: elements, err: null };
    };
    /**
     * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
     * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
     * are accepted:
     *
     * ```
     * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
     * tagName ::= [a-z] (PENChar)*
     * PENChar ::=
     *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
     *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
     *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
     * ```
     *
     * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
     * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
     * since other tag-based engines like React allow it
     */
    Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
        var startPosition = this.clonePosition();
        this.bump(); // `<`
        var tagName = this.parseTagName();
        this.bumpSpace();
        if (this.bumpIf('/>')) {
            // Self closing tag
            return {
                val: {
                    type: TYPE.literal,
                    value: "<" + tagName + "/>",
                    location: createLocation(startPosition, this.clonePosition()),
                },
                err: null,
            };
        }
        else if (this.bumpIf('>')) {
            var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
            if (childrenResult.err) {
                return childrenResult;
            }
            var children = childrenResult.val;
            // Expecting a close tag
            var endTagStartPosition = this.clonePosition();
            if (this.bumpIf('</')) {
                if (this.isEOF() || !_isAlpha(this.char())) {
                    return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                }
                var closingTagNameStartPosition = this.clonePosition();
                var closingTagName = this.parseTagName();
                if (tagName !== closingTagName) {
                    return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
                }
                this.bumpSpace();
                if (!this.bumpIf('>')) {
                    return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                }
                return {
                    val: {
                        type: TYPE.tag,
                        value: tagName,
                        children: children,
                        location: createLocation(startPosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            else {
                return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
            }
        }
        else {
            return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
        }
    };
    /**
     * This method assumes that the caller has peeked ahead for the first tag character.
     */
    Parser.prototype.parseTagName = function () {
        var startOffset = this.offset();
        this.bump(); // the first tag name character
        while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
            this.bump();
        }
        return this.message.slice(startOffset, this.offset());
    };
    Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
        var start = this.clonePosition();
        var value = '';
        while (true) {
            var parseQuoteResult = this.tryParseQuote(parentArgType);
            if (parseQuoteResult) {
                value += parseQuoteResult;
                continue;
            }
            var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
            if (parseUnquotedResult) {
                value += parseUnquotedResult;
                continue;
            }
            var parseLeftAngleResult = this.tryParseLeftAngleBracket();
            if (parseLeftAngleResult) {
                value += parseLeftAngleResult;
                continue;
            }
            break;
        }
        var location = createLocation(start, this.clonePosition());
        return {
            val: { type: TYPE.literal, value: value, location: location },
            err: null,
        };
    };
    Parser.prototype.tryParseLeftAngleBracket = function () {
        if (!this.isEOF() &&
            this.char() === 60 /* `<` */ &&
            (this.ignoreTag ||
                // If at the opening tag or closing tag position, bail.
                !_isAlphaOrSlash(this.peek() || 0))) {
            this.bump(); // `<`
            return '<';
        }
        return null;
    };
    /**
     * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
     * a character that requires quoting (that is, "only where needed"), and works the same in
     * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
     */
    Parser.prototype.tryParseQuote = function (parentArgType) {
        if (this.isEOF() || this.char() !== 39 /* `'` */) {
            return null;
        }
        // Parse escaped char following the apostrophe, or early return if there is no escaped char.
        // Check if is valid escaped character
        switch (this.peek()) {
            case 39 /* `'` */:
                // double quote, should return as a single quote.
                this.bump();
                this.bump();
                return "'";
            // '{', '<', '>', '}'
            case 123:
            case 60:
            case 62:
            case 125:
                break;
            case 35: // '#'
                if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
                    break;
                }
                return null;
            default:
                return null;
        }
        this.bump(); // apostrophe
        var codePoints = [this.char()]; // escaped char
        this.bump();
        // read chars until the optional closing apostrophe is found
        while (!this.isEOF()) {
            var ch = this.char();
            if (ch === 39 /* `'` */) {
                if (this.peek() === 39 /* `'` */) {
                    codePoints.push(39);
                    // Bump one more time because we need to skip 2 characters.
                    this.bump();
                }
                else {
                    // Optional closing apostrophe.
                    this.bump();
                    break;
                }
            }
            else {
                codePoints.push(ch);
            }
            this.bump();
        }
        return fromCodePoint.apply(void 0, codePoints);
    };
    Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
        if (this.isEOF()) {
            return null;
        }
        var ch = this.char();
        if (ch === 60 /* `<` */ ||
            ch === 123 /* `{` */ ||
            (ch === 35 /* `#` */ &&
                (parentArgType === 'plural' || parentArgType === 'selectordinal')) ||
            (ch === 125 /* `}` */ && nestingLevel > 0)) {
            return null;
        }
        else {
            this.bump();
            return fromCodePoint(ch);
        }
    };
    Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
        var openingBracePosition = this.clonePosition();
        this.bump(); // `{`
        this.bumpSpace();
        if (this.isEOF()) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        if (this.char() === 125 /* `}` */) {
            this.bump();
            return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        // argument name
        var value = this.parseIdentifierIfPossible().value;
        if (!value) {
            return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bumpSpace();
        if (this.isEOF()) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        switch (this.char()) {
            // Simple argument: `{name}`
            case 125 /* `}` */: {
                this.bump(); // `}`
                return {
                    val: {
                        type: TYPE.argument,
                        // value does not include the opening and closing braces.
                        value: value,
                        location: createLocation(openingBracePosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            // Argument with options: `{name, format, ...}`
            case 44 /* `,` */: {
                this.bump(); // `,`
                this.bumpSpace();
                if (this.isEOF()) {
                    return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
                }
                return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
            }
            default:
                return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
        }
    };
    /**
     * Advance the parser until the end of the identifier, if it is currently on
     * an identifier character. Return an empty string otherwise.
     */
    Parser.prototype.parseIdentifierIfPossible = function () {
        var startingPosition = this.clonePosition();
        var startOffset = this.offset();
        var value = matchIdentifierAtIndex(this.message, startOffset);
        var endOffset = startOffset + value.length;
        this.bumpTo(endOffset);
        var endPosition = this.clonePosition();
        var location = createLocation(startingPosition, endPosition);
        return { value: value, location: location };
    };
    Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
        var _a;
        // Parse this range:
        // {name, type, style}
        //        ^---^
        var typeStartPosition = this.clonePosition();
        var argType = this.parseIdentifierIfPossible().value;
        var typeEndPosition = this.clonePosition();
        switch (argType) {
            case '':
                // Expecting a style string number, date, time, plural, selectordinal, or select.
                return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
            case 'number':
            case 'date':
            case 'time': {
                // Parse this range:
                // {name, number, style}
                //              ^-------^
                this.bumpSpace();
                var styleAndLocation = null;
                if (this.bumpIf(',')) {
                    this.bumpSpace();
                    var styleStartPosition = this.clonePosition();
                    var result = this.parseSimpleArgStyleIfPossible();
                    if (result.err) {
                        return result;
                    }
                    var style = trimEnd(result.val);
                    if (style.length === 0) {
                        return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                    var styleLocation = createLocation(styleStartPosition, this.clonePosition());
                    styleAndLocation = { style: style, styleLocation: styleLocation };
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                var location_1 = createLocation(openingBracePosition, this.clonePosition());
                // Extract style or skeleton
                if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
                    // Skeleton starts with `::`.
                    var skeleton = trimStart(styleAndLocation.style.slice(2));
                    if (argType === 'number') {
                        var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                        if (result.err) {
                            return result;
                        }
                        return {
                            val: { type: TYPE.number, value: value, location: location_1, style: result.val },
                            err: null,
                        };
                    }
                    else {
                        if (skeleton.length === 0) {
                            return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                        }
                        var style = {
                            type: SKELETON_TYPE.dateTime,
                            pattern: skeleton,
                            location: styleAndLocation.styleLocation,
                            parsedOptions: this.shouldParseSkeletons
                                ? parseDateTimeSkeleton(skeleton)
                                : {},
                        };
                        var type = argType === 'date' ? TYPE.date : TYPE.time;
                        return {
                            val: { type: type, value: value, location: location_1, style: style },
                            err: null,
                        };
                    }
                }
                // Regular style or no style.
                return {
                    val: {
                        type: argType === 'number'
                            ? TYPE.number
                            : argType === 'date'
                                ? TYPE.date
                                : TYPE.time,
                        value: value,
                        location: location_1,
                        style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null,
                    },
                    err: null,
                };
            }
            case 'plural':
            case 'selectordinal':
            case 'select': {
                // Parse this range:
                // {name, plural, options}
                //              ^---------^
                var typeEndPosition_1 = this.clonePosition();
                this.bumpSpace();
                if (!this.bumpIf(',')) {
                    return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign$1({}, typeEndPosition_1)));
                }
                this.bumpSpace();
                // Parse offset:
                // {name, plural, offset:1, options}
                //                ^-----^
                //
                // or the first option:
                //
                // {name, plural, one {...} other {...}}
                //                ^--^
                var identifierAndLocation = this.parseIdentifierIfPossible();
                var pluralOffset = 0;
                if (argType !== 'select' && identifierAndLocation.value === 'offset') {
                    if (!this.bumpIf(':')) {
                        return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                    this.bumpSpace();
                    var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
                    if (result.err) {
                        return result;
                    }
                    // Parse another identifier for option parsing
                    this.bumpSpace();
                    identifierAndLocation = this.parseIdentifierIfPossible();
                    pluralOffset = result.val;
                }
                var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
                if (optionsResult.err) {
                    return optionsResult;
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                var location_2 = createLocation(openingBracePosition, this.clonePosition());
                if (argType === 'select') {
                    return {
                        val: {
                            type: TYPE.select,
                            value: value,
                            options: fromEntries(optionsResult.val),
                            location: location_2,
                        },
                        err: null,
                    };
                }
                else {
                    return {
                        val: {
                            type: TYPE.plural,
                            value: value,
                            options: fromEntries(optionsResult.val),
                            offset: pluralOffset,
                            pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                            location: location_2,
                        },
                        err: null,
                    };
                }
            }
            default:
                return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
        }
    };
    Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
        // Parse: {value, number, ::currency/GBP }
        //
        if (this.isEOF() || this.char() !== 125 /* `}` */) {
            return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
        }
        this.bump(); // `}`
        return { val: true, err: null };
    };
    /**
     * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
     */
    Parser.prototype.parseSimpleArgStyleIfPossible = function () {
        var nestedBraces = 0;
        var startPosition = this.clonePosition();
        while (!this.isEOF()) {
            var ch = this.char();
            switch (ch) {
                case 39 /* `'` */: {
                    // Treat apostrophe as quoting but include it in the style part.
                    // Find the end of the quoted literal text.
                    this.bump();
                    var apostrophePosition = this.clonePosition();
                    if (!this.bumpUntil("'")) {
                        return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
                    }
                    this.bump();
                    break;
                }
                case 123 /* `{` */: {
                    nestedBraces += 1;
                    this.bump();
                    break;
                }
                case 125 /* `}` */: {
                    if (nestedBraces > 0) {
                        nestedBraces -= 1;
                    }
                    else {
                        return {
                            val: this.message.slice(startPosition.offset, this.offset()),
                            err: null,
                        };
                    }
                    break;
                }
                default:
                    this.bump();
                    break;
            }
        }
        return {
            val: this.message.slice(startPosition.offset, this.offset()),
            err: null,
        };
    };
    Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
        var tokens = [];
        try {
            tokens = parseNumberSkeletonFromString(skeleton);
        }
        catch (e) {
            return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
        }
        return {
            val: {
                type: SKELETON_TYPE.number,
                tokens: tokens,
                location: location,
                parsedOptions: this.shouldParseSkeletons
                    ? parseNumberSkeleton(tokens)
                    : {},
            },
            err: null,
        };
    };
    /**
     * @param nesting_level The current nesting level of messages.
     *     This can be positive when parsing message fragment in select or plural argument options.
     * @param parent_arg_type The parent argument's type.
     * @param parsed_first_identifier If provided, this is the first identifier-like selector of
     *     the argument. It is a by-product of a previous parsing attempt.
     * @param expecting_close_tag If true, this message is directly or indirectly nested inside
     *     between a pair of opening and closing tags. The nested message will not parse beyond
     *     the closing tag boundary.
     */
    Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
        var _a;
        var hasOtherClause = false;
        var options = [];
        var parsedSelectors = new Set();
        var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
        // Parse:
        // one {one apple}
        // ^--^
        while (true) {
            if (selector.length === 0) {
                var startPosition = this.clonePosition();
                if (parentArgType !== 'select' && this.bumpIf('=')) {
                    // Try parse `={number}` selector
                    var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
                    if (result.err) {
                        return result;
                    }
                    selectorLocation = createLocation(startPosition, this.clonePosition());
                    selector = this.message.slice(startPosition.offset, this.offset());
                }
                else {
                    break;
                }
            }
            // Duplicate selector clauses
            if (parsedSelectors.has(selector)) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                    : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
            }
            if (selector === 'other') {
                hasOtherClause = true;
            }
            // Parse:
            // one {one apple}
            //     ^----------^
            this.bumpSpace();
            var openingBracePosition = this.clonePosition();
            if (!this.bumpIf('{')) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                    : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
            }
            var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
            if (fragmentResult.err) {
                return fragmentResult;
            }
            var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
            if (argCloseResult.err) {
                return argCloseResult;
            }
            options.push([
                selector,
                {
                    value: fragmentResult.val,
                    location: createLocation(openingBracePosition, this.clonePosition()),
                },
            ]);
            // Keep track of the existing selectors
            parsedSelectors.add(selector);
            // Prep next selector clause.
            this.bumpSpace();
            (_a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location);
        }
        if (options.length === 0) {
            return this.error(parentArgType === 'select'
                ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR
                : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
        }
        if (this.requiresOtherClause && !hasOtherClause) {
            return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
        }
        return { val: options, err: null };
    };
    Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
        var sign = 1;
        var startingPosition = this.clonePosition();
        if (this.bumpIf('+')) ;
        else if (this.bumpIf('-')) {
            sign = -1;
        }
        var hasDigits = false;
        var decimal = 0;
        while (!this.isEOF()) {
            var ch = this.char();
            if (ch >= 48 /* `0` */ && ch <= 57 /* `9` */) {
                hasDigits = true;
                decimal = decimal * 10 + (ch - 48);
                this.bump();
            }
            else {
                break;
            }
        }
        var location = createLocation(startingPosition, this.clonePosition());
        if (!hasDigits) {
            return this.error(expectNumberError, location);
        }
        decimal *= sign;
        if (!isSafeInteger(decimal)) {
            return this.error(invalidNumberError, location);
        }
        return { val: decimal, err: null };
    };
    Parser.prototype.offset = function () {
        return this.position.offset;
    };
    Parser.prototype.isEOF = function () {
        return this.offset() === this.message.length;
    };
    Parser.prototype.clonePosition = function () {
        // This is much faster than `Object.assign` or spread.
        return {
            offset: this.position.offset,
            line: this.position.line,
            column: this.position.column,
        };
    };
    /**
     * Return the code point at the current position of the parser.
     * Throws if the index is out of bound.
     */
    Parser.prototype.char = function () {
        var offset = this.position.offset;
        if (offset >= this.message.length) {
            throw Error('out of bound');
        }
        var code = codePointAt(this.message, offset);
        if (code === undefined) {
            throw Error("Offset " + offset + " is at invalid UTF-16 code unit boundary");
        }
        return code;
    };
    Parser.prototype.error = function (kind, location) {
        return {
            val: null,
            err: {
                kind: kind,
                message: this.message,
                location: location,
            },
        };
    };
    /** Bump the parser to the next UTF-16 code unit. */
    Parser.prototype.bump = function () {
        if (this.isEOF()) {
            return;
        }
        var code = this.char();
        if (code === 10 /* '\n' */) {
            this.position.line += 1;
            this.position.column = 1;
            this.position.offset += 1;
        }
        else {
            this.position.column += 1;
            // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.
            this.position.offset += code < 0x10000 ? 1 : 2;
        }
    };
    /**
     * If the substring starting at the current position of the parser has
     * the given prefix, then bump the parser to the character immediately
     * following the prefix and return true. Otherwise, don't bump the parser
     * and return false.
     */
    Parser.prototype.bumpIf = function (prefix) {
        if (startsWith(this.message, prefix, this.offset())) {
            for (var i = 0; i < prefix.length; i++) {
                this.bump();
            }
            return true;
        }
        return false;
    };
    /**
     * Bump the parser until the pattern character is found and return `true`.
     * Otherwise bump to the end of the file and return `false`.
     */
    Parser.prototype.bumpUntil = function (pattern) {
        var currentOffset = this.offset();
        var index = this.message.indexOf(pattern, currentOffset);
        if (index >= 0) {
            this.bumpTo(index);
            return true;
        }
        else {
            this.bumpTo(this.message.length);
            return false;
        }
    };
    /**
     * Bump the parser to the target offset.
     * If target offset is beyond the end of the input, bump the parser to the end of the input.
     */
    Parser.prototype.bumpTo = function (targetOffset) {
        if (this.offset() > targetOffset) {
            throw Error("targetOffset " + targetOffset + " must be greater than or equal to the current offset " + this.offset());
        }
        targetOffset = Math.min(targetOffset, this.message.length);
        while (true) {
            var offset = this.offset();
            if (offset === targetOffset) {
                break;
            }
            if (offset > targetOffset) {
                throw Error("targetOffset " + targetOffset + " is at invalid UTF-16 code unit boundary");
            }
            this.bump();
            if (this.isEOF()) {
                break;
            }
        }
    };
    /** advance the parser through all whitespace to the next non-whitespace code unit. */
    Parser.prototype.bumpSpace = function () {
        while (!this.isEOF() && _isWhiteSpace(this.char())) {
            this.bump();
        }
    };
    /**
     * Peek at the *next* Unicode codepoint in the input without advancing the parser.
     * If the input has been exhausted, then this returns null.
     */
    Parser.prototype.peek = function () {
        if (this.isEOF()) {
            return null;
        }
        var code = this.char();
        var offset = this.offset();
        var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
        return nextCode !== null && nextCode !== void 0 ? nextCode : null;
    };
    return Parser;
}());
/**
 * This check if codepoint is alphabet (lower & uppercase)
 * @param codepoint
 * @returns
 */
function _isAlpha(codepoint) {
    return ((codepoint >= 97 && codepoint <= 122) ||
        (codepoint >= 65 && codepoint <= 90));
}
function _isAlphaOrSlash(codepoint) {
    return _isAlpha(codepoint) || codepoint === 47; /* '/' */
}
/** See `parseTag` function docs. */
function _isPotentialElementNameChar(c) {
    return (c === 45 /* '-' */ ||
        c === 46 /* '.' */ ||
        (c >= 48 && c <= 57) /* 0..9 */ ||
        c === 95 /* '_' */ ||
        (c >= 97 && c <= 122) /** a..z */ ||
        (c >= 65 && c <= 90) /* A..Z */ ||
        c == 0xb7 ||
        (c >= 0xc0 && c <= 0xd6) ||
        (c >= 0xd8 && c <= 0xf6) ||
        (c >= 0xf8 && c <= 0x37d) ||
        (c >= 0x37f && c <= 0x1fff) ||
        (c >= 0x200c && c <= 0x200d) ||
        (c >= 0x203f && c <= 0x2040) ||
        (c >= 0x2070 && c <= 0x218f) ||
        (c >= 0x2c00 && c <= 0x2fef) ||
        (c >= 0x3001 && c <= 0xd7ff) ||
        (c >= 0xf900 && c <= 0xfdcf) ||
        (c >= 0xfdf0 && c <= 0xfffd) ||
        (c >= 0x10000 && c <= 0xeffff));
}
/**
 * Code point equivalent of regex `\p{White_Space}`.
 * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
function _isWhiteSpace(c) {
    return ((c >= 0x0009 && c <= 0x000d) ||
        c === 0x0020 ||
        c === 0x0085 ||
        (c >= 0x200e && c <= 0x200f) ||
        c === 0x2028 ||
        c === 0x2029);
}
/**
 * Code point equivalent of regex `\p{Pattern_Syntax}`.
 * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
function _isPatternSyntax(c) {
    return ((c >= 0x0021 && c <= 0x0023) ||
        c === 0x0024 ||
        (c >= 0x0025 && c <= 0x0027) ||
        c === 0x0028 ||
        c === 0x0029 ||
        c === 0x002a ||
        c === 0x002b ||
        c === 0x002c ||
        c === 0x002d ||
        (c >= 0x002e && c <= 0x002f) ||
        (c >= 0x003a && c <= 0x003b) ||
        (c >= 0x003c && c <= 0x003e) ||
        (c >= 0x003f && c <= 0x0040) ||
        c === 0x005b ||
        c === 0x005c ||
        c === 0x005d ||
        c === 0x005e ||
        c === 0x0060 ||
        c === 0x007b ||
        c === 0x007c ||
        c === 0x007d ||
        c === 0x007e ||
        c === 0x00a1 ||
        (c >= 0x00a2 && c <= 0x00a5) ||
        c === 0x00a6 ||
        c === 0x00a7 ||
        c === 0x00a9 ||
        c === 0x00ab ||
        c === 0x00ac ||
        c === 0x00ae ||
        c === 0x00b0 ||
        c === 0x00b1 ||
        c === 0x00b6 ||
        c === 0x00bb ||
        c === 0x00bf ||
        c === 0x00d7 ||
        c === 0x00f7 ||
        (c >= 0x2010 && c <= 0x2015) ||
        (c >= 0x2016 && c <= 0x2017) ||
        c === 0x2018 ||
        c === 0x2019 ||
        c === 0x201a ||
        (c >= 0x201b && c <= 0x201c) ||
        c === 0x201d ||
        c === 0x201e ||
        c === 0x201f ||
        (c >= 0x2020 && c <= 0x2027) ||
        (c >= 0x2030 && c <= 0x2038) ||
        c === 0x2039 ||
        c === 0x203a ||
        (c >= 0x203b && c <= 0x203e) ||
        (c >= 0x2041 && c <= 0x2043) ||
        c === 0x2044 ||
        c === 0x2045 ||
        c === 0x2046 ||
        (c >= 0x2047 && c <= 0x2051) ||
        c === 0x2052 ||
        c === 0x2053 ||
        (c >= 0x2055 && c <= 0x205e) ||
        (c >= 0x2190 && c <= 0x2194) ||
        (c >= 0x2195 && c <= 0x2199) ||
        (c >= 0x219a && c <= 0x219b) ||
        (c >= 0x219c && c <= 0x219f) ||
        c === 0x21a0 ||
        (c >= 0x21a1 && c <= 0x21a2) ||
        c === 0x21a3 ||
        (c >= 0x21a4 && c <= 0x21a5) ||
        c === 0x21a6 ||
        (c >= 0x21a7 && c <= 0x21ad) ||
        c === 0x21ae ||
        (c >= 0x21af && c <= 0x21cd) ||
        (c >= 0x21ce && c <= 0x21cf) ||
        (c >= 0x21d0 && c <= 0x21d1) ||
        c === 0x21d2 ||
        c === 0x21d3 ||
        c === 0x21d4 ||
        (c >= 0x21d5 && c <= 0x21f3) ||
        (c >= 0x21f4 && c <= 0x22ff) ||
        (c >= 0x2300 && c <= 0x2307) ||
        c === 0x2308 ||
        c === 0x2309 ||
        c === 0x230a ||
        c === 0x230b ||
        (c >= 0x230c && c <= 0x231f) ||
        (c >= 0x2320 && c <= 0x2321) ||
        (c >= 0x2322 && c <= 0x2328) ||
        c === 0x2329 ||
        c === 0x232a ||
        (c >= 0x232b && c <= 0x237b) ||
        c === 0x237c ||
        (c >= 0x237d && c <= 0x239a) ||
        (c >= 0x239b && c <= 0x23b3) ||
        (c >= 0x23b4 && c <= 0x23db) ||
        (c >= 0x23dc && c <= 0x23e1) ||
        (c >= 0x23e2 && c <= 0x2426) ||
        (c >= 0x2427 && c <= 0x243f) ||
        (c >= 0x2440 && c <= 0x244a) ||
        (c >= 0x244b && c <= 0x245f) ||
        (c >= 0x2500 && c <= 0x25b6) ||
        c === 0x25b7 ||
        (c >= 0x25b8 && c <= 0x25c0) ||
        c === 0x25c1 ||
        (c >= 0x25c2 && c <= 0x25f7) ||
        (c >= 0x25f8 && c <= 0x25ff) ||
        (c >= 0x2600 && c <= 0x266e) ||
        c === 0x266f ||
        (c >= 0x2670 && c <= 0x2767) ||
        c === 0x2768 ||
        c === 0x2769 ||
        c === 0x276a ||
        c === 0x276b ||
        c === 0x276c ||
        c === 0x276d ||
        c === 0x276e ||
        c === 0x276f ||
        c === 0x2770 ||
        c === 0x2771 ||
        c === 0x2772 ||
        c === 0x2773 ||
        c === 0x2774 ||
        c === 0x2775 ||
        (c >= 0x2794 && c <= 0x27bf) ||
        (c >= 0x27c0 && c <= 0x27c4) ||
        c === 0x27c5 ||
        c === 0x27c6 ||
        (c >= 0x27c7 && c <= 0x27e5) ||
        c === 0x27e6 ||
        c === 0x27e7 ||
        c === 0x27e8 ||
        c === 0x27e9 ||
        c === 0x27ea ||
        c === 0x27eb ||
        c === 0x27ec ||
        c === 0x27ed ||
        c === 0x27ee ||
        c === 0x27ef ||
        (c >= 0x27f0 && c <= 0x27ff) ||
        (c >= 0x2800 && c <= 0x28ff) ||
        (c >= 0x2900 && c <= 0x2982) ||
        c === 0x2983 ||
        c === 0x2984 ||
        c === 0x2985 ||
        c === 0x2986 ||
        c === 0x2987 ||
        c === 0x2988 ||
        c === 0x2989 ||
        c === 0x298a ||
        c === 0x298b ||
        c === 0x298c ||
        c === 0x298d ||
        c === 0x298e ||
        c === 0x298f ||
        c === 0x2990 ||
        c === 0x2991 ||
        c === 0x2992 ||
        c === 0x2993 ||
        c === 0x2994 ||
        c === 0x2995 ||
        c === 0x2996 ||
        c === 0x2997 ||
        c === 0x2998 ||
        (c >= 0x2999 && c <= 0x29d7) ||
        c === 0x29d8 ||
        c === 0x29d9 ||
        c === 0x29da ||
        c === 0x29db ||
        (c >= 0x29dc && c <= 0x29fb) ||
        c === 0x29fc ||
        c === 0x29fd ||
        (c >= 0x29fe && c <= 0x2aff) ||
        (c >= 0x2b00 && c <= 0x2b2f) ||
        (c >= 0x2b30 && c <= 0x2b44) ||
        (c >= 0x2b45 && c <= 0x2b46) ||
        (c >= 0x2b47 && c <= 0x2b4c) ||
        (c >= 0x2b4d && c <= 0x2b73) ||
        (c >= 0x2b74 && c <= 0x2b75) ||
        (c >= 0x2b76 && c <= 0x2b95) ||
        c === 0x2b96 ||
        (c >= 0x2b97 && c <= 0x2bff) ||
        (c >= 0x2e00 && c <= 0x2e01) ||
        c === 0x2e02 ||
        c === 0x2e03 ||
        c === 0x2e04 ||
        c === 0x2e05 ||
        (c >= 0x2e06 && c <= 0x2e08) ||
        c === 0x2e09 ||
        c === 0x2e0a ||
        c === 0x2e0b ||
        c === 0x2e0c ||
        c === 0x2e0d ||
        (c >= 0x2e0e && c <= 0x2e16) ||
        c === 0x2e17 ||
        (c >= 0x2e18 && c <= 0x2e19) ||
        c === 0x2e1a ||
        c === 0x2e1b ||
        c === 0x2e1c ||
        c === 0x2e1d ||
        (c >= 0x2e1e && c <= 0x2e1f) ||
        c === 0x2e20 ||
        c === 0x2e21 ||
        c === 0x2e22 ||
        c === 0x2e23 ||
        c === 0x2e24 ||
        c === 0x2e25 ||
        c === 0x2e26 ||
        c === 0x2e27 ||
        c === 0x2e28 ||
        c === 0x2e29 ||
        (c >= 0x2e2a && c <= 0x2e2e) ||
        c === 0x2e2f ||
        (c >= 0x2e30 && c <= 0x2e39) ||
        (c >= 0x2e3a && c <= 0x2e3b) ||
        (c >= 0x2e3c && c <= 0x2e3f) ||
        c === 0x2e40 ||
        c === 0x2e41 ||
        c === 0x2e42 ||
        (c >= 0x2e43 && c <= 0x2e4f) ||
        (c >= 0x2e50 && c <= 0x2e51) ||
        c === 0x2e52 ||
        (c >= 0x2e53 && c <= 0x2e7f) ||
        (c >= 0x3001 && c <= 0x3003) ||
        c === 0x3008 ||
        c === 0x3009 ||
        c === 0x300a ||
        c === 0x300b ||
        c === 0x300c ||
        c === 0x300d ||
        c === 0x300e ||
        c === 0x300f ||
        c === 0x3010 ||
        c === 0x3011 ||
        (c >= 0x3012 && c <= 0x3013) ||
        c === 0x3014 ||
        c === 0x3015 ||
        c === 0x3016 ||
        c === 0x3017 ||
        c === 0x3018 ||
        c === 0x3019 ||
        c === 0x301a ||
        c === 0x301b ||
        c === 0x301c ||
        c === 0x301d ||
        (c >= 0x301e && c <= 0x301f) ||
        c === 0x3020 ||
        c === 0x3030 ||
        c === 0xfd3e ||
        c === 0xfd3f ||
        (c >= 0xfe45 && c <= 0xfe46));
}

function pruneLocation(els) {
    els.forEach(function (el) {
        delete el.location;
        if (isSelectElement(el) || isPluralElement(el)) {
            for (var k in el.options) {
                delete el.options[k].location;
                pruneLocation(el.options[k].value);
            }
        }
        else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
            delete el.style.location;
        }
        else if ((isDateElement(el) || isTimeElement(el)) &&
            isDateTimeSkeleton(el.style)) {
            delete el.style.location;
        }
        else if (isTagElement(el)) {
            pruneLocation(el.children);
        }
    });
}
function parse(message, opts) {
    if (opts === void 0) { opts = {}; }
    opts = __assign$1({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
    var result = new Parser(message, opts).parse();
    if (result.err) {
        var error = SyntaxError(ErrorKind[result.err.kind]);
        // @ts-expect-error Assign to error object
        error.location = result.err.location;
        // @ts-expect-error Assign to error object
        error.originalMessage = result.err.message;
        throw error;
    }
    if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
        pruneLocation(result.val);
    }
    return result.val;
}

//
// Main
//
function memoize(fn, options) {
    var cache = options && options.cache ? options.cache : cacheDefault;
    var serializer = options && options.serializer ? options.serializer : serializerDefault;
    var strategy = options && options.strategy ? options.strategy : strategyDefault;
    return strategy(fn, {
        cache: cache,
        serializer: serializer,
    });
}
//
// Strategy
//
function isPrimitive(value) {
    return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
}
function monadic(fn, cache, serializer, arg) {
    var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.call(this, arg);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function variadic(fn, cache, serializer) {
    var args = Array.prototype.slice.call(arguments, 3);
    var cacheKey = serializer(args);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.apply(this, args);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
    return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
    var strategy = fn.length === 1 ? monadic : variadic;
    return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
    return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
    return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
//
// Serializer
//
var serializerDefault = function () {
    return JSON.stringify(arguments);
};
//
// Cache
//
function ObjectWithoutPrototypeCache() {
    this.cache = Object.create(null);
}
ObjectWithoutPrototypeCache.prototype.has = function (key) {
    return key in this.cache;
};
ObjectWithoutPrototypeCache.prototype.get = function (key) {
    return this.cache[key];
};
ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
    this.cache[key] = value;
};
var cacheDefault = {
    create: function create() {
        // @ts-ignore
        return new ObjectWithoutPrototypeCache();
    },
};
var strategies = {
    variadic: strategyVariadic,
    monadic: strategyMonadic,
};

var ErrorCode;
(function (ErrorCode) {
    // When we have a placeholder but no value to format
    ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
    // When value supplied is invalid
    ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
    // When we need specific Intl API but it's not available
    ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
})(ErrorCode || (ErrorCode = {}));
var FormatError = /** @class */ (function (_super) {
    __extends(FormatError, _super);
    function FormatError(msg, code, originalMessage) {
        var _this = _super.call(this, msg) || this;
        _this.code = code;
        _this.originalMessage = originalMessage;
        return _this;
    }
    FormatError.prototype.toString = function () {
        return "[formatjs Error: " + this.code + "] " + this.message;
    };
    return FormatError;
}(Error));
var InvalidValueError = /** @class */ (function (_super) {
    __extends(InvalidValueError, _super);
    function InvalidValueError(variableId, value, options, originalMessage) {
        return _super.call(this, "Invalid values for \"" + variableId + "\": \"" + value + "\". Options are \"" + Object.keys(options).join('", "') + "\"", ErrorCode.INVALID_VALUE, originalMessage) || this;
    }
    return InvalidValueError;
}(FormatError));
var InvalidValueTypeError = /** @class */ (function (_super) {
    __extends(InvalidValueTypeError, _super);
    function InvalidValueTypeError(value, type, originalMessage) {
        return _super.call(this, "Value for \"" + value + "\" must be of type " + type, ErrorCode.INVALID_VALUE, originalMessage) || this;
    }
    return InvalidValueTypeError;
}(FormatError));
var MissingValueError = /** @class */ (function (_super) {
    __extends(MissingValueError, _super);
    function MissingValueError(variableId, originalMessage) {
        return _super.call(this, "The intl string context variable \"" + variableId + "\" was not provided to the string \"" + originalMessage + "\"", ErrorCode.MISSING_VALUE, originalMessage) || this;
    }
    return MissingValueError;
}(FormatError));

var PART_TYPE;
(function (PART_TYPE) {
    PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
    PART_TYPE[PART_TYPE["object"] = 1] = "object";
})(PART_TYPE || (PART_TYPE = {}));
function mergeLiteral(parts) {
    if (parts.length < 2) {
        return parts;
    }
    return parts.reduce(function (all, part) {
        var lastPart = all[all.length - 1];
        if (!lastPart ||
            lastPart.type !== PART_TYPE.literal ||
            part.type !== PART_TYPE.literal) {
            all.push(part);
        }
        else {
            lastPart.value += part.value;
        }
        return all;
    }, []);
}
function isFormatXMLElementFn(el) {
    return typeof el === 'function';
}
// TODO(skeleton): add skeleton support
function formatToParts(els, locales, formatters, formats, values, currentPluralValue, 
// For debugging
originalMessage) {
    // Hot path for straight simple msg translations
    if (els.length === 1 && isLiteralElement(els[0])) {
        return [
            {
                type: PART_TYPE.literal,
                value: els[0].value,
            },
        ];
    }
    var result = [];
    for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
        var el = els_1[_i];
        // Exit early for string parts.
        if (isLiteralElement(el)) {
            result.push({
                type: PART_TYPE.literal,
                value: el.value,
            });
            continue;
        }
        // TODO: should this part be literal type?
        // Replace `#` in plural rules with the actual numeric value.
        if (isPoundElement(el)) {
            if (typeof currentPluralValue === 'number') {
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters.getNumberFormat(locales).format(currentPluralValue),
                });
            }
            continue;
        }
        var varName = el.value;
        // Enforce that all required values are provided by the caller.
        if (!(values && varName in values)) {
            throw new MissingValueError(varName, originalMessage);
        }
        var value = values[varName];
        if (isArgumentElement(el)) {
            if (!value || typeof value === 'string' || typeof value === 'number') {
                value =
                    typeof value === 'string' || typeof value === 'number'
                        ? String(value)
                        : '';
            }
            result.push({
                type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                value: value,
            });
            continue;
        }
        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (isDateElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.date[el.style]
                : isDateTimeSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getDateTimeFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isTimeElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.time[el.style]
                : isDateTimeSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getDateTimeFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isNumberElement(el)) {
            var style = typeof el.style === 'string'
                ? formats.number[el.style]
                : isNumberSkeleton(el.style)
                    ? el.style.parsedOptions
                    : undefined;
            if (style && style.scale) {
                value =
                    value *
                        (style.scale || 1);
            }
            result.push({
                type: PART_TYPE.literal,
                value: formatters
                    .getNumberFormat(locales, style)
                    .format(value),
            });
            continue;
        }
        if (isTagElement(el)) {
            var children = el.children, value_1 = el.value;
            var formatFn = values[value_1];
            if (!isFormatXMLElementFn(formatFn)) {
                throw new InvalidValueTypeError(value_1, 'function', originalMessage);
            }
            var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
            var chunks = formatFn(parts.map(function (p) { return p.value; }));
            if (!Array.isArray(chunks)) {
                chunks = [chunks];
            }
            result.push.apply(result, chunks.map(function (c) {
                return {
                    type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                    value: c,
                };
            }));
        }
        if (isSelectElement(el)) {
            var opt = el.options[value] || el.options.other;
            if (!opt) {
                throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
            }
            result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
            continue;
        }
        if (isPluralElement(el)) {
            var opt = el.options["=" + value];
            if (!opt) {
                if (!Intl.PluralRules) {
                    throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
                }
                var rule = formatters
                    .getPluralRules(locales, { type: el.pluralType })
                    .select(value - (el.offset || 0));
                opt = el.options[rule] || el.options.other;
            }
            if (!opt) {
                throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
            }
            result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
            continue;
        }
    }
    return mergeLiteral(result);
}

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/
// -- MessageFormat --------------------------------------------------------
function mergeConfig(c1, c2) {
    if (!c2) {
        return c1;
    }
    return __assign$2(__assign$2(__assign$2({}, (c1 || {})), (c2 || {})), Object.keys(c1).reduce(function (all, k) {
        all[k] = __assign$2(__assign$2({}, c1[k]), (c2[k] || {}));
        return all;
    }, {}));
}
function mergeConfigs(defaultConfig, configs) {
    if (!configs) {
        return defaultConfig;
    }
    return Object.keys(defaultConfig).reduce(function (all, k) {
        all[k] = mergeConfig(defaultConfig[k], configs[k]);
        return all;
    }, __assign$2({}, defaultConfig));
}
function createFastMemoizeCache(store) {
    return {
        create: function () {
            return {
                has: function (key) {
                    return key in store;
                },
                get: function (key) {
                    return store[key];
                },
                set: function (key, value) {
                    store[key] = value;
                },
            };
        },
    };
}
function createDefaultFormatters(cache) {
    if (cache === void 0) { cache = {
        number: {},
        dateTime: {},
        pluralRules: {},
    }; }
    return {
        getNumberFormat: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args)))();
        }, {
            cache: createFastMemoizeCache(cache.number),
            strategy: strategies.variadic,
        }),
        getDateTimeFormat: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args)))();
        }, {
            cache: createFastMemoizeCache(cache.dateTime),
            strategy: strategies.variadic,
        }),
        getPluralRules: memoize(function () {
            var _a;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args)))();
        }, {
            cache: createFastMemoizeCache(cache.pluralRules),
            strategy: strategies.variadic,
        }),
    };
}
var IntlMessageFormat = /** @class */ (function () {
    function IntlMessageFormat(message, locales, overrideFormats, opts) {
        var _this = this;
        if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
        this.formatterCache = {
            number: {},
            dateTime: {},
            pluralRules: {},
        };
        this.format = function (values) {
            var parts = _this.formatToParts(values);
            // Hot path for straight simple msg translations
            if (parts.length === 1) {
                return parts[0].value;
            }
            var result = parts.reduce(function (all, part) {
                if (!all.length ||
                    part.type !== PART_TYPE.literal ||
                    typeof all[all.length - 1] !== 'string') {
                    all.push(part.value);
                }
                else {
                    all[all.length - 1] += part.value;
                }
                return all;
            }, []);
            if (result.length <= 1) {
                return result[0] || '';
            }
            return result;
        };
        this.formatToParts = function (values) {
            return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
        };
        this.resolvedOptions = function () { return ({
            locale: Intl.NumberFormat.supportedLocalesOf(_this.locales)[0],
        }); };
        this.getAst = function () { return _this.ast; };
        if (typeof message === 'string') {
            this.message = message;
            if (!IntlMessageFormat.__parse) {
                throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
            }
            // Parse string messages into an AST.
            this.ast = IntlMessageFormat.__parse(message, {
                ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
            });
        }
        else {
            this.ast = message;
        }
        if (!Array.isArray(this.ast)) {
            throw new TypeError('A message must be provided as a String or AST.');
        }
        // Creates a new object with the specified `formats` merged with the default
        // formats.
        this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
        // Defined first because it's used to build the format pattern.
        this.locales = locales;
        this.formatters =
            (opts && opts.formatters) || createDefaultFormatters(this.formatterCache);
    }
    Object.defineProperty(IntlMessageFormat, "defaultLocale", {
        get: function () {
            if (!IntlMessageFormat.memoizedDefaultLocale) {
                IntlMessageFormat.memoizedDefaultLocale =
                    new Intl.NumberFormat().resolvedOptions().locale;
            }
            return IntlMessageFormat.memoizedDefaultLocale;
        },
        enumerable: false,
        configurable: true
    });
    IntlMessageFormat.memoizedDefaultLocale = null;
    IntlMessageFormat.__parse = parse;
    // Default format options used as the prototype of the `formats` provided to the
    // constructor. These are used when constructing the internal Intl.NumberFormat
    // and Intl.DateTimeFormat instances.
    IntlMessageFormat.formats = {
        number: {
            currency: {
                style: 'currency',
            },
            percent: {
                style: 'percent',
            },
        },
        date: {
            short: {
                month: 'numeric',
                day: 'numeric',
                year: '2-digit',
            },
            medium: {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
            long: {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            },
            full: {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            },
        },
        time: {
            short: {
                hour: 'numeric',
                minute: 'numeric',
            },
            medium: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            },
            long: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            },
            full: {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                timeZoneName: 'short',
            },
        },
    };
    return IntlMessageFormat;
}());

/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

class TranslationInfo {
    constructor(translationsPath) {
        // Map from language to loading promise
        this.loadingPromises = new Map();
        // Fallback locale: null if no fallback is used. A locale string if the
        // fallback is being loaded or has completed loading.
        this.fallbackLocale = null;
        this.fallbackStatus = LoadingStatus.NONE;
        // Map from language to strings
        this.strings = new Map();
        // Map to keep track of the current language of a custom element.
        // Also used for garbage collection.
        this.elementLanguages = new Map();
        this.translationsPath = translationsPath;
    }
    async updateLanguage(customElement, lang) {
        var _a;
        // Get existing promise or trigger a new load
        const promise = (_a = this.loadingPromises.get(lang)) !== null && _a !== void 0 ? _a : this.loadLanguage(lang);
        // Register loading promise
        if (this.loadingPromises.get(lang) !== promise) {
            this.loadingPromises.set(lang, promise);
        }
        // Cache strings
        const strings = await promise;
        if (this.strings.get(lang) !== strings) {
            this.strings.set(lang, strings);
        }
        if (customElement && this.elementLanguages.get(customElement) !== lang) {
            this.elementLanguages.set(customElement, lang);
        }
        return strings;
    }
    async loadFallbackLocale(fallbackLocale) {
        this.fallbackLocale = fallbackLocale;
        this.fallbackStatus = LoadingStatus.LOADING;
        // Load language, but do not set is as current locale on the custom element.
        return this.updateLanguage(null, fallbackLocale).finally(() => {
            this.fallbackStatus = LoadingStatus.LOADED;
        });
    }
    getTranslationsPath(lang) {
        return this.translationsPath.replace('$language', lang);
    }
    async loadLanguage(lang) {
        const path = this.getTranslationsPath(lang);
        return fetch(path)
            .then(res => res.json())
            .catch((error) => {
            console.error(`Error loading translations from ${path}. Error: ${error}.`);
            return {};
        });
    }
    getElementLanguage(customElement) {
        return this.elementLanguages.get(customElement);
    }
    translate(customElement, key, parameters = {}) {
        const currentLanguage = this.getElementLanguage(customElement);
        const languages = [...new Set([currentLanguage, this.fallbackLocale])].filter(Boolean);
        let text = null;
        for (const language of languages) {
            const strings = this.strings.get(language);
            if (!strings) {
                // eslint-disable-next-line no-continue
                continue;
            }
            text = TranslationInfo.lookup(key, strings);
            // Text found: stop looking any further
            if (text !== null) {
                // Parse the found translation using intl-messageformat
                text = new IntlMessageFormat(text).format(parameters);
                break;
            }
        }
        return text;
    }
    registerInstance(customElement) {
        if (this.garbageCollectTimeout) {
            clearTimeout(this.garbageCollectTimeout);
        }
        this.elementLanguages.set(customElement, null);
    }
    unregisterInstance(customElement) {
        this.elementLanguages.delete(customElement);
    }
    hasInstances() {
        return this.elementLanguages.size > 0;
    }
    updateAllInstances() {
        for (const customElement of this.elementLanguages.keys()) {
            if (customElement.isConnected) {
                customElement.requestUpdate();
            }
        }
    }
    scheduleGarbageCollection(handler, time) {
        // Clear possible previous timeout
        if (this.garbageCollectTimeout) {
            clearTimeout(this.garbageCollectTimeout);
        }
        this.garbageCollectTimeout = setTimeout((() => {
            if (this.hasInstances()) {
                return;
            }
            handler();
        }), time);
    }
    /**
     * Returns a string based on a chain of keys using the dot notation.
     */
    // Based on https://github.com/andreasbm/lit-translate/blob/b5fe3c3ef9d7f8db9e5f33d3b8b147ce2f53d7cd/src/lib/helpers.ts#L19-L35
    static lookup(key, strings) {
        // Split the key in parts (example: hello.world)
        const parts = key.split('.');
        // Find the string by traversing through the strings matching the chain of keys
        let string = strings;
        // Shift through all of the parts of the key while matching with the strings.
        // Do not continue if the string is not defined or if we have traversed all of the key parts
        while (string !== null && string !== undefined && parts.length > 0) {
            string = string[parts.shift()];
        }
        // Make sure the string is in fact a string!
        return string != null ? string.toString() : null;
    }
}

class TranslationService {
    static register(customElement, customElementKey, translationsPath) {
        var _a;
        if (!this.info.get(customElementKey)) {
            this.info.set(customElementKey, new TranslationInfo(translationsPath));
        }
        (_a = this.info.get(customElementKey)) === null || _a === void 0 ? void 0 : _a.registerInstance(customElement);
    }
    static unregister(customElement, customElementKey) {
        const info = this.info.get(customElementKey);
        if (!info) {
            return;
        }
        info.unregisterInstance(customElement);
        // Garbage collect
        if (!info.hasInstances()) {
            info.scheduleGarbageCollection(() => {
                this.info.delete(customElementKey);
            }, this.GARBAGE_COLLECTION_TIMEOUT);
        }
    }
    static updateLanguage(customElement, customElementKey, language) {
        const info = this.info.get(customElementKey);
        if (!info) {
            return Promise.reject(new Error(`Custom elment ${customElementKey} has not yet been registered with the translation service.`));
        }
        return info.updateLanguage(customElement, language);
    }
    static t(customElement, customElementKey, key, parameters = {}) {
        const defaultValue = `[${key}]`;
        if (!customElement || !customElementKey) {
            return defaultValue;
        }
        const info = this.info.get(customElementKey);
        if (!info) {
            return defaultValue;
        }
        // Translate value (looks at the current locale and, if loaded, the fallback locale)
        const value = info.translate(customElement, key, parameters);
        // If no value is returned, check if a fallback can be used
        if (value === null && info.getElementLanguage(customElement) !== this.FALLBACK_LOCALE) {
            switch (info.fallbackStatus) {
                case LoadingStatus.NONE:
                    // Fallback is not loaded yet.
                    info.loadFallbackLocale(this.FALLBACK_LOCALE).then(() => {
                        // Update translations once fallback locale is loaded.
                        info.updateAllInstances();
                    });
                    // Prevent flash of unstyled content (FOUC): return an empty
                    // string. This leaves the translation empty until the fallback
                    // locale is returned. Then either a fallback string is used,
                    // or if not present, the default value.
                    return '';
                case LoadingStatus.LOADING:
                    // Prevent FOUC while the fallback is still loading.
                    return '';
                case LoadingStatus.LOADED:
                    // If the fallback has been loaded and if the value is not
                    // present in both the locale and the fallback, return the
                    // default value.
                    return defaultValue;
            }
        }
        return value !== null && value !== void 0 ? value : defaultValue;
    }
}
TranslationService.info = new Map();
// Time (in ms) after which a TranslationInfo object is cleaned up when it
// has become unused. When it is cleaned up, the translations are re-downloaded
// when a custom element needs the info again. This is not a big issue since
// the files are cache in the browser.
TranslationService.GARBAGE_COLLECTION_TIMEOUT = 30 * 60 * 1000; // 30-minutes
TranslationService.FALLBACK_LOCALE = 'en-US';

// Base class for both BaseTool and BaseSettings
class BaseRoot extends LitElement {
    constructor() {
        super(...arguments);
        this.assetPath = '../assets/';
        this.baseAssetPath = '../assets/';
        this.translationsPath = 'translations/$language.json';
        this.locale = 'en-US';
        this._translationsLoaded = false;
        this.deferredReady = new Deferred();
        this.assetService = null;
    }
    get toolName() {
        let elementNameLower = this.tagName.toLowerCase();
        if (elementNameLower.startsWith('gynzy-')) {
            elementNameLower = elementNameLower.substring('gynzy-'.length);
        }
        if (elementNameLower.endsWith('-settings')) {
            elementNameLower = elementNameLower.substring(0, elementNameLower.length - '-settings'.length);
        }
        return elementNameLower;
    }
    connectedCallback() {
        var _a, _b;
        super.connectedCallback();
        // Initialize asset service
        if (this.assetPath) {
            this.assetService = new AssetService(this.assetPath, this.baseAssetPath);
        }
        // Get asset path for relative paths
        const translationsPath = ((_a = this.translationsPath) !== null && _a !== void 0 ? _a : '').startsWith('http') || ((_b = this.translationsPath) !== null && _b !== void 0 ? _b : '').startsWith('/')
            ? this.translationsPath
            : this.getAssetPath(this.translationsPath);
        // Register translations service
        TranslationService.register(this, this.toolName, translationsPath.replace('$toolName', this.toolName));
        // Load initial language
        const promise = TranslationService.updateLanguage(this, this.toolName, this.locale);
        promise.finally(() => {
            this._translationsLoaded = true;
            this.translationsLoaded();
            this.requestUpdate();
            this.deferredReady.resolve();
        });
    }
    disconnectedCallback() {
        TranslationService.unregister(this, this.toolName);
    }
    /**
     * Await additional state before fulfilling the updateComplete promise.
     * In tests, the fixture() method awaits this promise.
     */
    async _getUpdateComplete() {
        await super._getUpdateComplete();
        await this.deferredReady.promise;
    }
    // Defer the first update of the component until the strings have been
    // loaded to avoid empty strings being shown.
    shouldUpdate(changedProperties) {
        return this._translationsLoaded && super.shouldUpdate(changedProperties);
    }
    // Function is executed when translations are loaded.
    // eslint-disable-next-line class-methods-use-this
    translationsLoaded() {
        // overwrite in derived class
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        changedProperties.forEach((_, propName) => {
            switch (propName) {
                case 'locale':
                    TranslationService.updateLanguage(this, this.toolName, this.locale)
                        .catch((error) => {
                        console.error(`Error updating language to ${this.locale}. ${error}`);
                    })
                        .finally(() => {
                        this.requestUpdate();
                    });
                    break;
            }
        });
    }
    t(key, parameters = {}) {
        return TranslationService.t(this, this.toolName, key, parameters);
    }
    playAudioUrls(urls, options) {
        AudioService.playAudioUrls(this, urls, options);
    }
    getAssetPath(relativePath) {
        var _a, _b;
        return (_b = (_a = this.assetService) === null || _a === void 0 ? void 0 : _a.getAssetPath(relativePath)) !== null && _b !== void 0 ? _b : '';
    }
    getBaseAssetPath(relativePath) {
        var _a, _b;
        return (_b = (_a = this.assetService) === null || _a === void 0 ? void 0 : _a.getBaseAssetPath(relativePath)) !== null && _b !== void 0 ? _b : '';
    }
}
__decorate([
    property({ type: String })
], BaseRoot.prototype, "assetPath", void 0);
__decorate([
    property({ type: String })
], BaseRoot.prototype, "baseAssetPath", void 0);
__decorate([
    property({ type: String })
], BaseRoot.prototype, "translationsPath", void 0);
__decorate([
    property({ type: String })
], BaseRoot.prototype, "locale", void 0);

class BaseTool extends BaseRoot {
    constructor() {
        super();
        this.toolDefinition = {
            width: 1280,
            height: 660,
            settingsComponent: '',
            globalToolData: false,
            autoComponentReady: true,
        };
        this.displayScale = { x: 1, y: 1 }; // Combined scale of container element(s)
        this._toolData = {};
        this._isInitiated = false;
        // listen for settings updates
        this.addEventListener('settingsUpdated', (e) => {
            this.handleSettingsUpdate(e.detail);
        });
    }
    get toolData() {
        return this._toolData;
    }
    set toolData(val) {
        const oldValue = this._toolData;
        this._toolData = val;
        this.handleToolDataUpdated();
        this.requestUpdate('toolData', oldValue);
    }
    getDefinition() {
        return this.toolDefinition;
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this._isInitiated) {
            this._isInitiated = true;
            this.handleToolData();
        }
        this.deferredReady.promise.then(() => {
            if (this.toolDefinition.autoComponentReady) {
                this.componentReady();
            }
        });
    }
    /**
     * @deprecated This function should not be used anymore, use handleToolData instead
     */
    // function is executed when toolData attribute is updated
    // eslint-disable-next-line class-methods-use-this
    handleToolDataUpdated() {
        // overwrite in derived class
        // console.log('handleToolDataUpdated - tooData =', this.toolData);
    }
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    handleSettingsUpdate(detail) {
        // overwrite in derived class
        // console.log('handleSettingsUpdate - detail =', detail);
    }
    /**
     * This function is called when the tool is ready to handle toolData
     */
    // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
    handleToolData() {
        // overwrite in derived class
    }
    /**
     * dispatch event to save data in webcomponent tool element
     */
    saveToolData(data) {
        const event = new CustomEvent('saveToolData', {
            detail: {
                data,
            },
        });
        this.dispatchEvent(event);
    }
    /**
     * dispatch event to update tool size on board
     */
    updateSize(width, height) {
        const event = new CustomEvent('updateSize', {
            detail: {
                width,
                height,
            },
        });
        this.dispatchEvent(event);
    }
    /**
     * dispatch event to open this tool's settings component.
     * This renders the webcomponent defined in toolDefinition.settingsComponent
     */
    openSettingsComponent() {
        const event = new CustomEvent('openSettings');
        this.dispatchEvent(event);
    }
    /**
     * Informs the parent application that the tool is ready to use.
     */
    componentReady() {
        const event = new CustomEvent('componentReady');
        this.dispatchEvent(event);
    }
    render() {
        return html ` <p>BaseTool</p> `;
    }
}
BaseTool.styles = [
    css `
			:host {
				display: block;
				font-weight: 400;
				font-family: var(--font-family-base);
				font-size: 16px;
				line-height: 24px;
				color: var(--color-shuttle-gray);
			}
		`,
];
__decorate([
    property({ type: Object })
], BaseTool.prototype, "displayScale", void 0);
__decorate([
    property({ type: undefined })
], BaseTool.prototype, "toolData", null);

class BaseElement extends LitElement {
    constructor() {
        super(...arguments);
        this.assetPath = null;
        this.baseAssetPath = null;
        this.assetService = null;
        this.rootAssetService = null;
        this.baseRoot = null;
    }
    connectedCallback() {
        super.connectedCallback();
        this.rootAssetService = AssetService.getRootAssetService(this);
        this.baseRoot = BaseElement.getBaseRoot(this);
        // Initialize asset service (only used during tests)
        if (this.assetPath) {
            this.assetService = new AssetService(this.assetPath, this.baseAssetPath);
        }
    }
    getAssetPath(relativePath) {
        var _a, _b, _c;
        return (_c = (_b = ((_a = this.assetService) !== null && _a !== void 0 ? _a : this.rootAssetService)) === null || _b === void 0 ? void 0 : _b.getAssetPath(relativePath)) !== null && _c !== void 0 ? _c : '';
    }
    getBaseAssetPath(relativePath) {
        var _a, _b, _c;
        return (_c = (_b = ((_a = this.assetService) !== null && _a !== void 0 ? _a : this.rootAssetService)) === null || _b === void 0 ? void 0 : _b.getBaseAssetPath(relativePath)) !== null && _c !== void 0 ? _c : '';
    }
    static getBaseRoot(element) {
        let elt = element;
        while (elt) {
            // Use toolName as a marker for cases where the instance
            // check does not work.
            if (elt instanceof BaseRoot || elt.toolName) {
                return elt;
            }
            if (elt instanceof ShadowRoot) {
                elt = elt.host;
            }
            else {
                elt = elt.getRootNode();
            }
            // Top reached
            if (elt instanceof Document) {
                break;
            }
        }
        return null;
    }
    t(key, parameters = {}) {
        var _a;
        return TranslationService.t(this.baseRoot, (_a = this.baseRoot) === null || _a === void 0 ? void 0 : _a.toolName, key, parameters);
    }
    playAudioUrls(urls, options) {
        if (!this.baseRoot) {
            return;
        }
        AudioService.playAudioUrls(this.baseRoot, urls, options);
    }
}
__decorate([
    property({ type: String })
], BaseElement.prototype, "assetPath", void 0);
__decorate([
    property({ type: String })
], BaseElement.prototype, "baseAssetPath", void 0);

class BaseSettings extends BaseRoot {
    constructor() {
        super(...arguments);
        this._saveEnabled = true;
    }
    /**
     * dispatch 'updateSaveButton' event to enable or disable save settings button on board
     */
    enableSaveButton(isEnabled) {
        if (isEnabled !== this._saveEnabled) {
            this._saveEnabled = isEnabled;
            const event = new CustomEvent('updateSaveButton', {
                detail: {
                    enabled: this._saveEnabled,
                },
            });
            this.dispatchEvent(event);
        }
    }
    /**
     * dispatch 'updateSettings' event so the host application can track the changed settings
     * @param toolData {Record<string, unknown>} - object with updated settings- or tooldata
     * the default options suggest: avoid the object type, use Record<string, unknown>
     * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-types.md#default-options
     */
    updateSettings(toolData) {
        const event = new CustomEvent('updateSettings', {
            detail: toolData,
        });
        this.dispatchEvent(event);
    }
}
BaseSettings.styles = [
    css `
			:host {
				font-family: var(--font-family-base);
				font-weight: 400;
				color: var(--color-shuttle-grey);
				width: 100%;
			}

			.settings-component {
				display: flex;
				padding: calc(var(--px-rem-ratio) * 32) 0;
			}

			.settings-column {
				display: flex;
				flex-direction: column;
				flex: 1;
				padding: 0 calc(var(--px-rem-ratio) * 32);
			}

			.settings-column.narrow {
				flex: 0 1 auto;
			}

			.settings-column:not(:last-child) {
				border-right: 1px solid var(--color-ghost);
			}

			.settings-section {
				display: flex;
				flex-direction: column;
				flex-wrap: wrap;
			}

			.settings-section:not(:first-of-type) {
				margin-top: calc(var(--px-rem-ratio) * 24);
			}

			.settings-section > *:not(:last-child) {
				margin-bottom: calc(var(--px-rem-ratio) * 8);
			}

			.d-flex {
				display: flex;
				flex-direction: column;
			}

			.flex-row {
				flex-direction: row;
			}

			.flex-column {
				flex-direction: column;
			}

			.spacing-right-small > *:not(:last-child) {
				margin-right: calc(var(--px-rem-ratio) * 8);
			}

			.spacing-right-medium > *:not(:last-child) {
				margin-right: calc(var(--px-rem-ratio) * 12);
			}

			.spacing-right-large > *:not(:last-child) {
				margin-right: calc(var(--px-rem-ratio) * 24);
			}

			.spacing-bottom-small > *:not(:last-child) {
				margin-bottom: calc(var(--px-rem-ratio) * 8);
			}
		`,
];

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Stores the StyleInfo object applied to a given AttributePart.
 * Used to unset existing values when a new StyleInfo object is applied.
 */
const previousStylePropertyCache = new WeakMap();
/**
 * A directive that applies CSS properties to an element.
 *
 * `styleMap` can only be used in the `style` attribute and must be the only
 * expression in the attribute. It takes the property names in the `styleInfo`
 * object and adds the property values as CSS properties. Property names with
 * dashes (`-`) are assumed to be valid CSS property names and set on the
 * element's style object using `setProperty()`. Names without dashes are
 * assumed to be camelCased JavaScript property names and set on the element's
 * style object using property assignment, allowing the style object to
 * translate JavaScript-style names to CSS property names.
 *
 * For example `styleMap({backgroundColor: 'red', 'border-top': '5px', '--size':
 * '0'})` sets the `background-color`, `border-top` and `--size` properties.
 *
 * @param styleInfo {StyleInfo}
 */
const styleMap = directive((styleInfo) => (part) => {
    if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
        part.committer.name !== 'style' || part.committer.parts.length > 1) {
        throw new Error('The `styleMap` directive must be used in the style attribute ' +
            'and must be the only part in the attribute.');
    }
    const { committer } = part;
    const { style } = committer.element;
    let previousStyleProperties = previousStylePropertyCache.get(part);
    if (previousStyleProperties === undefined) {
        // Write static styles once
        style.cssText = committer.strings.join(' ');
        previousStylePropertyCache.set(part, previousStyleProperties = new Set());
    }
    // Remove old properties that no longer exist in styleInfo
    // We use forEach() instead of for-of so that re don't require down-level
    // iteration.
    previousStyleProperties.forEach((name) => {
        if (!(name in styleInfo)) {
            previousStyleProperties.delete(name);
            if (name.indexOf('-') === -1) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style[name] = null;
            }
            else {
                style.removeProperty(name);
            }
        }
    });
    // Add or update properties
    for (const name in styleInfo) {
        previousStyleProperties.add(name);
        if (name.indexOf('-') === -1) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style[name] = styleInfo[name];
        }
        else {
            style.setProperty(name, styleInfo[name]);
        }
    }
});

let ButtonRegular = class ButtonRegular extends BaseElement {
    constructor() {
        super(...arguments);
        this.text = '';
        this.icon = '';
        /**
         * button color style
         * values: primary (default), secondary, light
         */
        this.color = ButtonColors.PRIMARY;
        /**
         * button size style
         * values: medium (default), small
         */
        this.size = ButtonSizes.MEDIUM;
        /**
         * button environment style
         * values:
         * tool (default) - button is styled in px
         * settings - button is styled in rem
         */
        this.environment = Environments.TOOL;
        this.disabled = false;
        this.buttonStyle = {};
    }
    /**
     * define button minWidth in px or rem,
     * example values: "100px" or "20rem"
     */
    set minWidth(val) {
        // set min-width of button when defined
        if (val.trim().endsWith('px') || val.trim().endsWith('rem')) {
            this.buttonStyle = { minWidth: `${val}` };
        }
        else {
            this.buttonStyle = {};
        }
    }
    render() {
        return html `
			<button
				class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
				.disabled=${this.disabled}
				style=${styleMap(this.buttonStyle)}
			>
				${this.icon ? html `<img src="${this.getBaseAssetPath(`icons/icon-${this.icon}.svg`)}" alt="icon" />` : ''}
				<span>${this.text}</span>
			</button>
		`;
    }
};
ButtonRegular.styles = [
    css `
			button {
				position: relative;
				text-decoration: none;
				text-indent: 0;
				cursor: pointer;
				user-select: none;
				white-space: nowrap;
				font-family: var(--font-family-base);
				font-style: normal;
				font-weight: 600;
				display: flex;
				align-items: center;
				text-align: center;
				flex-direction: row;
				justify-content: center;
				outline: 0;
				border: none;

				transition-property: background-color, box-shadow, color, opacity;
				transition-duration: var(--button-transition-duration);
			}

			button img,
			button span {
				transition-property: filter, opacity;
				transition-duration: var(--button-transition-duration);
			}

			button.color--primary {
				color: var(--color-white);
				background-color: var(--color-mariner);
				box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
			}

			button.color--primary img {
				filter: var(--color-filter-white);
			}

			button.color--primary:hover {
				background-color: var(--color-mariner-light);
			}

			button.color--primary:active {
				background-color: var(--color-mariner-dark);
				box-shadow: none;
			}

			button:active img,
			button:active span {
				opacity: 0.7;
			}

			button.color--secondary {
				color: var(--color-shuttle-gray);
				background-color: var(--color-solitude);
				box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
			}

			button.color--secondary img {
				filter: var(--color-filter-shuttle-gray);
			}

			button.color--secondary:hover {
				background-color: var(--color-aqua-haze);
			}

			button.color--secondary:active {
				background-color: var(--color-ghost);
				box-shadow: none;
			}

			button.color--light {
				color: var(--color-shuttle-gray);
				border: 1px solid var(--color-heather);
				background-color: var(--color-white);
			}

			button.color--light img {
				filter: var(--color-shuttle-gray);
			}

			button.color--light:hover {
				color: var(--color-mariner);
			}

			button.color--light:hover img {
				filter: var(--color-filter-mariner);
			}

			button.color--light:active {
				background-color: var(--color-aqua-haze);
			}

			button:disabled {
				cursor: default;
				opacity: 0.5;
				pointer-events: none;
			}

			button.color--light:disabled img {
				opacity: 0.5;
			}

			button.size--medium {
				padding: 0 20px;
				font-size: 16px;
				min-height: 40px;
				border-radius: 6px;
			}

			button.size--medium img {
				width: 12px;
				height: 12px;
				margin-right: 8px;
			}

			button.size--medium.environment--settings {
				padding: 0.89rem 2.04rem;
				font-size: 1.66rem;
				min-height: 4.17rem;
				border-radius: 0.63rem;
			}

			button.size--medium.environment--settings img {
				width: 1.66rem;
				height: 1.66rem;
				margin-right: 1.04rem;
			}

			button.size--small {
				padding: 0 16px;
				font-size: 12px;
				min-height: 32px;
				border-radius: 4px;
			}

			button.size--small img {
				width: 10px;
				height: 10px;
				margin-right: 6px;
			}

			button.size--small.environment--settings {
				padding: 0.63rem 1.56rem;
				font-size: 1.25rem;
				min-height: 3.13rem;
				border-radius: 0.52rem;
			}

			button.size--small.environment--settings img {
				width: 1.25rem;
				height: 1.25rem;
				margin-right: 0.73rem;
			}
		`,
];
__decorate([
    property({ type: String })
], ButtonRegular.prototype, "text", void 0);
__decorate([
    property({ type: String })
], ButtonRegular.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], ButtonRegular.prototype, "color", void 0);
__decorate([
    property({ type: String })
], ButtonRegular.prototype, "size", void 0);
__decorate([
    property({ type: String })
], ButtonRegular.prototype, "environment", void 0);
__decorate([
    property({ type: Boolean })
], ButtonRegular.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], ButtonRegular.prototype, "minWidth", null);
__decorate([
    internalProperty()
], ButtonRegular.prototype, "buttonStyle", void 0);
ButtonRegular = __decorate([
    customElement('gynzy-button-regular')
], ButtonRegular);

let ButtonSquare = class ButtonSquare extends BaseElement {
    constructor() {
        super(...arguments);
        this.icon = '';
        /**
         * button color style
         * values: primary (default), secondary, light
         */
        this.color = ButtonColors.PRIMARY;
        /**
         * button size style
         * values: medium (default), small
         */
        this.size = ButtonSizes.MEDIUM;
        /**
         * button environment style
         * values:
         * tool (default) - button is styled in px
         * settings - button is styled in rem
         */
        this.environment = Environments.TOOL;
        this.disabled = false;
    }
    render() {
        return html `
			<button
				class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
				.disabled=${this.disabled}
			>
				${this.icon
            ? html `<img src="${this.getBaseAssetPath(`icons/icon-${this.icon}.svg`)}" alt="icon" draggable="false" />`
            : ''}
			</button>
		`;
    }
};
ButtonSquare.styles = [
    css `
			button {
				position: relative;
				text-decoration: none;
				text-indent: 0;
				cursor: pointer;
				user-select: none;
				white-space: nowrap;
				font-family: var(--font-family-base);
				font-style: normal;
				font-weight: 600;
				display: flex;
				align-items: center;
				text-align: center;
				flex-direction: row;
				justify-content: center;
				outline: 0;
				border: none;

				transition-property: background-color, box-shadow, color, opacity;
				transition-duration: var(--button-transition-duration);
			}

			button img {
				transition-property: filter, opacity;
				transition-duration: var(--button-transition-duration);
			}

			button.color--primary {
				color: var(--color-white);
				background-color: var(--color-mariner);
				box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
			}

			button.color--primary img {
				filter: var(--color-filter-white);
			}

			button.color--primary:hover {
				background-color: var(--color-mariner-light);
			}

			button.color--primary:active {
				background-color: var(--color-mariner-dark);
				box-shadow: none;
			}

			button:active img,
			button:active span {
				opacity: 0.7;
			}

			button.color--secondary {
				color: var(--color-shuttle-gray);
				background-color: var(--color-solitude);
				box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
			}

			button.color--secondary img {
				filter: var(--color-filter-shuttle-gray);
			}

			button.color--secondary:hover {
				background-color: var(--color-aqua-haze);
			}

			button.color--secondary:active {
				background-color: var(--color-ghost);
				box-shadow: none;
			}

			button.color--light {
				color: var(--color-shuttle-gray);
				border: 1px solid var(--color-heather);
				background-color: var(--color-white);
			}

			button.color--light img {
				filter: var(--color-shuttle-gray);
			}

			button.color--light:hover {
				color: var(--color-mariner);
			}

			button.color--light:hover img {
				filter: var(--color-filter-mariner);
			}

			button.color--light:active {
				background-color: var(--color-aqua-haze);
			}

			button:disabled {
				cursor: default;
				opacity: 0.5;
				pointer-events: none;
			}

			button.color--light:disabled img {
				opacity: 0.5;
			}

			/* large */

			button.size--large {
				padding: 12px;
				font-size: 20px;
				min-height: 40px;
				border-radius: 6px;
			}

			button.size--large img {
				width: 20px;
				height: 20px;
			}

			button.size--large.environment--settings {
				padding: 0.89rem 2.04rem;
				font-size: calc(var(--px-rem-ratio) * 20);
				min-height: calc(var(--px-rem-ratio) * 40);
				border-radius: 6px;
			}

			button.size--large.environment--settings img {
				width: calc(var(--px-rem-ratio) * 20);
				height: calc(var(--px-rem-ratio) * 20);
			}

			/* medium */

			button.size--medium {
				padding: 12px;
				font-size: 16px;
				min-height: 40px;
				border-radius: 6px;
			}

			button.size--medium img {
				width: 16px;
				height: 16px;
			}

			button.size--medium.environment--settings {
				padding: 0.89rem 2.04rem;
				font-size: 1.66rem;
				min-height: 4.17rem;
				border-radius: 0.63rem;
			}

			button.size--medium.environment--settings img {
				width: 1.66rem;
				height: 1.66rem;
			}

			/* small */

			button.size--small {
				padding: 10px;
				font-size: 12px;
				min-height: 32px;
				border-radius: 4px;
			}

			button.size--small img {
				width: 12px;
				height: 12px;
			}

			button.size--small.environment--settings {
				padding: 0.63rem 1.56rem;
				font-size: 1.25rem;
				min-height: 3.13rem;
				border-radius: 0.52rem;
			}

			button.size--small.environment--settings img {
				width: 1.25rem;
				height: 1.25rem;
			}
		`,
];
__decorate([
    property({ type: String })
], ButtonSquare.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], ButtonSquare.prototype, "color", void 0);
__decorate([
    property({ type: String })
], ButtonSquare.prototype, "size", void 0);
__decorate([
    property({ type: String })
], ButtonSquare.prototype, "environment", void 0);
__decorate([
    property({ type: Boolean })
], ButtonSquare.prototype, "disabled", void 0);
ButtonSquare = __decorate([
    customElement('gynzy-button-square')
], ButtonSquare);

let ButtonRound = class ButtonRound extends BaseElement {
    constructor() {
        super(...arguments);
        this.icon = '';
        /**
         * button color style
         * values: primary (default), secondary, light
         */
        this.color = ButtonColors.PRIMARY;
        /**
         * button size style
         * values: large, medium (default), small
         */
        this.size = ButtonSizes.MEDIUM;
        /**
         * button environment style
         * values:
         * tool (default) - button is styled in px
         * settings - button is styled in rem (not yet supported)
         */
        this.environment = Environments.TOOL;
        this.disabled = false;
    }
    render() {
        return html `
			<button
				class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
				.disabled=${this.disabled}
			>
				${this.icon
            ? html `<img src="${this.getBaseAssetPath(`icons/icon-${this.icon}.svg`)}" alt="icon" draggable="false" />`
            : ''}
			</button>
		`;
    }
};
ButtonRound.styles = css `
		button {
			position: relative;
			text-decoration: none;
			text-indent: 0;
			cursor: pointer;
			user-select: none;
			white-space: nowrap;
			font-family: var(--font-family-base);
			font-style: normal;
			font-weight: 600;
			display: flex;
			align-items: center;
			text-align: center;
			flex-direction: row;
			justify-content: center;
			outline: 0;
			border: none;
			border-radius: 50%;

			transition-property: background-color, box-shadow, color, opacity;
			transition-duration: var(--button-transition-duration);
		}

		button img {
			transition-property: filter, opacity;
			transition-duration: var(--button-transition-duration);
		}

		button.color--primary {
			color: var(--color-white);
			background-color: var(--color-mariner);
		}

		button.color--primary img {
			filter: var(--color-filter-white);
		}

		button.color--primary:hover {
			background-color: var(--color-mariner-light);
		}

		button.color--primary:active {
			background-color: var(--color-mariner-dark);
		}

		button:active img {
			opacity: 0.7;
		}

		button.color--secondary {
			color: var(--color-shuttle-gray);
			background-color: var(--color-solitude);
		}

		button.color--secondary img {
			filter: var(--color-filter-shuttle-gray);
		}

		button.color--secondary:hover {
			background-color: var(--color-aqua-haze);
		}

		button.color--secondary:active {
			background-color: var(--color-ghost);
		}

		button.color--light {
			color: var(--color-shuttle-gray);
			border: 1px solid var(--color-heather);
			background-color: var(--color-white);
		}

		button.color--light img {
			filter: var(--color-shuttle-gray);
		}

		button.color--light:hover {
			color: var(--color-mariner);
		}

		button.color--light:hover img {
			filter: var(--color-filter-mariner);
		}

		button.color--light:active {
			background-color: var(--color-aqua-haze);
		}

		button:disabled {
			cursor: default;
			opacity: 0.5;
			pointer-events: none;
		}

		button.color--light:disabled img {
			opacity: 0.5;
		}

		button.size--large {
			width: 32px;
			height: 32px;
		}

		button.size--large img {
			width: 16px;
			height: 16px;
		}

		button.size--medium {
			width: 24px;
			height: 24px;
		}

		button.size--medium img {
			width: 12px;
			height: 12px;
		}

		button.size--small {
			width: 16px;
			height: 16px;
		}

		button.size--small img {
			width: 8px;
			height: 8px;
		}
	`;
__decorate([
    property({ type: String })
], ButtonRound.prototype, "icon", void 0);
__decorate([
    property({ type: String })
], ButtonRound.prototype, "color", void 0);
__decorate([
    property({ type: String })
], ButtonRound.prototype, "size", void 0);
__decorate([
    property({ type: String })
], ButtonRound.prototype, "environment", void 0);
__decorate([
    property({ type: Boolean })
], ButtonRound.prototype, "disabled", void 0);
ButtonRound = __decorate([
    customElement('gynzy-button-round')
], ButtonRound);

let ButtonGroup = class ButtonGroup extends ButtonSquare {
    constructor() {
        super(...arguments);
        this.orientation = ButtonOrientations.VERTICAL;
        this.icons = [];
        this.groupDisabled = [];
    }
    _onClick(button) {
        this.dispatchEvent(new CustomEvent('onClick', {
            detail: {
                button,
            },
        }));
    }
    render() {
        return html `
			<div class="button-group orientation--${this.orientation}">
				<button
					@click=${() => this._onClick('first')}
					class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
					.disabled=${this.groupDisabled[0]}
				>
					${this.icons[0]
            ? html `<img
								src="${this.getBaseAssetPath(`icons/icon-${this.icons[0]}.svg`)}"
								alt="icon"
								draggable="false"
						  />`
            : ''}
				</button>

				<button
					@click=${() => this._onClick('second')}
					class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
					.disabled=${this.groupDisabled[1]}
				>
					${this.icons[1]
            ? html `<img
								src="${this.getBaseAssetPath(`icons/icon-${this.icons[1]}.svg`)}"
								alt="icon"
								draggable="false"
						  />`
            : ''}
				</button>
			</div>
		`;
    }
};
ButtonGroup.styles = [
    ...ButtonSquare.styles,
    css `
			/* icon size changes */
			button.size--medium img {
				width: 20px;
				height: 20px;
			}

			button.size--medium.environment--settings img {
				width: calc(var(--px-rem-ratio) * 20);
				height: calc(var(--px-rem-ratio) * 20);
			}

			/* group styling */
			.button-group {
				display: flex;
			}

			.button-group.orientation--vertical {
				flex-direction: column;
			}
			.button-group.orientation--vertical > :first-child {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				box-shadow: none;
				border-bottom: 1px solid;
				border-color: var(--color-mariner-dark);
			}
			.button-group.orientation--vertical > :last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
				/* box-shadow: none; */
			}

			.button-group.orientation--horizontal {
				flex-direction: row;
			}
			.button-group.orientation--horizontal > :first-child {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				box-shadow: none;
			}
		`,
];
__decorate([
    property({ type: String })
], ButtonGroup.prototype, "orientation", void 0);
__decorate([
    property({ type: Array })
], ButtonGroup.prototype, "icons", void 0);
__decorate([
    property({ type: Array })
], ButtonGroup.prototype, "groupDisabled", void 0);
ButtonGroup = __decorate([
    customElement('gynzy-button-group')
], ButtonGroup);

let InputCheckbox = class InputCheckbox extends BaseElement {
    constructor() {
        super(...arguments);
        this.id = '';
        this.value = '';
        this.name = '';
        this.label = '';
        this.indeterminate = false;
        this.checked = false;
        this.disabled = false;
    }
    render() {
        return html `
			<label class="${this.disabled ? 'disabled' : ''}">
				<input
					class="${this.indeterminate ? 'indeterminate' : ''}"
					type="checkbox"
					.id="${this.id}"
					.value=${this.value}
					.name=${this.name}
					.checked=${this.checked}
					.disabled=${this.disabled}
					@change=${this.onChange}
				/>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 20 20"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
				>
					<g id="Assets" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
						<g id="checkbox">
							<path
								d="M4,0 L16,0 C18.209139,-4.05812251e-16 20,1.790861 20,4 L20,16 C20,18.209139 18.209139,20 16,20 L4,20 C1.790861,20 2.705415e-16,18.209139 0,16 L0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 Z"
								id="checkbox_outside"
							></path>
							<path
								d="M4,3 L16,3 C16.5522847,3 17,3.44771525 17,4 L17,16 C17,16.5522847 16.5522847,17 16,17 L4,17 C3.44771525,17 3,16.5522847 3,16 L3,4 C3,3.44771525 3.44771525,3 4,3 Z"
								id="checkbox_inside"
							></path>
							<path
								d="M16.4871819,7.38057068 C16.4871819,7.58983432 16.4034764,7.79909796 16.2528066,7.94976779 L9.05413728,15.1484371 C8.90346745,15.2991069 8.69420381,15.3828124 8.48494017,15.3828124 C8.27567653,15.3828124 8.06641289,15.2991069 7.91574306,15.1484371 L3.74721131,10.9799053 C3.59654149,10.8292355 3.51283603,10.6199719 3.51283603,10.4107082 C3.51283603,10.2014446 3.59654149,9.99218093 3.74721131,9.84151111 L4.88560552,8.7031169 C5.03627534,8.55244708 5.24553899,8.46874162 5.45480263,8.46874162 C5.66406627,8.46874162 5.87332991,8.55244708 6.02399974,8.7031169 L8.48494017,11.1724279 L13.9760181,5.67297936 C14.126688,5.52230953 14.3359516,5.43860408 14.5452153,5.43860408 C14.7544789,5.43860408 14.9637425,5.52230953 15.1144124,5.67297936 L16.2528066,6.81137357 C16.4034764,6.96204339 16.4871819,7.17130704 16.4871819,7.38057068 Z"
								id="checkmark"
								fill="#FFFFFF"
							></path>
							<path
								id="indeterminate"
								fill="#FFFFFF"
								d="M 17.019 9.268 L 17.019 10.732 C 17.019 10.936 16.926 11.109 16.74 11.251 C 16.554 11.393 16.328 11.465 16.062 11.465 L 3.938 11.465 C 3.672 11.465 3.446 11.393 3.26 11.251 C 3.074 11.109 2.981 10.936 2.981 10.732 L 2.981 9.268 C 2.981 9.065 3.074 8.892 3.26 8.75 C 3.446 8.608 3.672 8.536 3.938 8.536 L 16.062 8.536 C 16.328 8.536 16.554 8.608 16.74 8.75 C 16.926 8.892 17.019 9.065 17.019 9.268 Z"
							></path>
						</g>
					</g>
				</svg>
				${this.label}
			</label>
		`;
    }
    onChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                id: this.id,
                value: this.value,
                name: this.name,
                label: this.label,
            },
        }));
    }
};
InputCheckbox.styles = css `
		label {
			font-size: calc(var(--px-rem-ratio) * 16);
			line-height: calc(var(--px-rem-ratio) * 24);
			font-family: var(--font-family-base);
			font-weight: 400;
			color: var(--color-shuttle-gray);
			display: flex;
			cursor: pointer;
			user-select: none;
			width: fit-content;
		}
		label.disabled {
			opacity: 0.5;
			cursor: auto;
		}
		svg {
			width: calc(var(--px-rem-ratio) * 20);
			height: calc(var(--px-rem-ratio) * 20);
			border: 1px solid;
			border-radius: 0.42rem;
			border-color: var(--color-heather);

			margin-right: calc(var(--px-rem-ratio) * 12);
			flex-shrink: 0;
		}

		svg #checkbox {
			width: 100%;
		}
		svg #checkbox_outside {
			fill: var(--color-white);
		}
		svg #checkbox_inside {
			fill: var(--color-alabaster);
		}
		svg #checkmark,
		#indeterminate {
			opacity: 0;
			fill: var(--color-white);
		}
		label input {
			display: none;
		}
		input:checked + svg,
		input.indeterminate + svg {
			border-color: var(--color-mariner);
			background-color: var(--color-mariner);
		}
		input:checked + svg #checkbox_inside,
		input.indeterminate + svg #checkbox_inside,
		input:checked + svg #checkbox_outside,
		input.indeterminate + svg #checkbox_outside {
			fill: var(--color-mariner);
		}
		input:checked + svg #checkmark {
			opacity: 1;
		}
		input:not(:checked).indeterminate + svg #indeterminate {
			opacity: 1;
		}
		input:not(:checked):not(.indeterminate):not(:disabled):hover + svg #checkbox_inside {
			fill: var(--color-mariner);
			opacity: 0.2;
		}
		input:checked:not(:disabled):hover + svg,
		input.indeterminate:not(:disabled):hover + svg {
			border-color: var(--color-mariner-light);
			background-color: var(--color-mariner-light);
		}
		input:checked:not(:disabled):hover + svg #checkbox_inside,
		input.indeterminate:not(:disabled):hover + svg #checkbox_inside,
		input:checked:not(:disabled):hover + svg #checkbox_outside,
		input.indeterminate:not(:disabled):hover + svg #checkbox_outside {
			fill: var(--color-mariner-light);
		}
	`;
__decorate([
    property({ type: String })
], InputCheckbox.prototype, "id", void 0);
__decorate([
    property({ type: String })
], InputCheckbox.prototype, "value", void 0);
__decorate([
    property({ type: String })
], InputCheckbox.prototype, "name", void 0);
__decorate([
    property({ type: String })
], InputCheckbox.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], InputCheckbox.prototype, "indeterminate", void 0);
__decorate([
    property({ type: Boolean })
], InputCheckbox.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean })
], InputCheckbox.prototype, "disabled", void 0);
InputCheckbox = __decorate([
    customElement('gynzy-input-checkbox')
], InputCheckbox);

let InputRadio = class InputRadio extends BaseElement {
    constructor() {
        super(...arguments);
        this.id = '';
        this.value = '';
        this.name = '';
        this.label = '';
        this.checked = false;
    }
    render() {
        return html `
			<label>
				<input
					type="radio"
					.id="${this.id}"
					.value=${this.value}
					.name=${this.name}
					.checked=${this.checked}
					@change=${this.onChange}
				/>
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 20 20"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
				>
					<g id="Assets" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
						<g id="radiobtn">
							<circle id="radiobtn_outside" cx="10" cy="10" r="10"></circle>
							<circle id="radiobtn_inside" cx="10" cy="10" r="6"></circle>
						</g>
					</g>
				</svg>
				${this.label}
			</label>
		`;
    }
    onChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                id: this.id,
                name: this.name,
                value: this.value,
                label: this.label,
            },
        }));
    }
};
InputRadio.styles = css `
		label {
			font-size: calc(var(--px-rem-ratio) * 16);
			line-height: calc(var(--px-rem-ratio) * 24);
			font-family: var(--font-family-base);
			font-weight: 400;
			color: var(--color-shuttle-gray);
			display: flex;
			cursor: pointer;
			user-select: none;
			width: fit-content;
		}
		svg {
			width: calc(var(--px-rem-ratio) * 20);
			height: calc(var(--px-rem-ratio) * 20);

			border: 1px solid;
			border-radius: 50%;
			border-color: var(--color-heather);

			margin-right: calc(var(--px-rem-ratio) * 12);
			flex-shrink: 0;
		}
		svg #radiobtn_outside {
			fill: var(--color-white);
		}
		svg #radiobtn_inside {
			fill: var(--color-alabaster);
		}
		label input {
			display: none;
		}
		input:checked + svg {
			border-color: var(--color-mariner);
		}
		input:checked + svg #radiobtn_inside {
			fill: var(--color-mariner);
		}
		input:not(:checked):hover + svg #radiobtn_inside {
			fill: var(--color-mariner);
			opacity: 0.2;
		}
	`;
__decorate([
    property({ type: String })
], InputRadio.prototype, "id", void 0);
__decorate([
    property({ type: String })
], InputRadio.prototype, "value", void 0);
__decorate([
    property({ type: String })
], InputRadio.prototype, "name", void 0);
__decorate([
    property({ type: String })
], InputRadio.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], InputRadio.prototype, "checked", void 0);
InputRadio = __decorate([
    customElement('gynzy-input-radio')
], InputRadio);

let InputDigit = class InputDigit extends ButtonSquare {
    constructor() {
        super(...arguments);
        this.id = '';
        this.name = '';
        /**
         * true: each digit is independent (0 - 9),
         * false (default): with number 29, next click on + button for ones will change number to 30
         */
        this.independent = false;
        this.value = undefined;
        this.valueArray = [];
        this.size = ButtonSizes.MEDIUM;
        this.digitLength = undefined;
        this.inputs = [];
        /**
         * input environment style
         * values:
         * tool - input is styled in px
         * settings (default) - input is styled in rem
         */
        this.environment = Environments.SETTINGS;
        this.inputElements = [];
    }
    updated(changedProperties) {
        changedProperties.forEach((_, propName) => {
            switch (propName) {
                case 'value':
                    this._parseValueToArray();
                    this._fillValueArrayWithBlanks();
                    break;
                case 'digitLength':
                    this._parseValueToArray();
                    this._fillValueArrayWithBlanks();
                    break;
            }
        });
    }
    _parseValueToArray() {
        if (this.value !== undefined) {
            this.valueArray = Array.from(this.value.toString()).map(Number);
        }
        else {
            this.valueArray = [];
        }
    }
    _fillValueArrayWithBlanks() {
        if (this.digitLength !== undefined) {
            const difference = this.digitLength - this.valueArray.length;
            if (this.valueArray.length < this.digitLength) {
                for (let i = 0; i < difference; i++) {
                    this.valueArray.unshift(0);
                }
            }
        }
    }
    _changeValue(action, index) {
        switch (action) {
            case 'plus':
                if (this.independent) {
                    if (this.valueArray[index] === 9)
                        return;
                    this.valueArray[index] += 1;
                }
                else {
                    if (index !== 0 && this.valueArray[index] === 9 && this.valueArray[index - 1] !== 9) {
                        // cross tens
                        this.valueArray[index] = 0;
                        this.valueArray[index - 1] += 1;
                        break;
                    }
                    // regular plus
                    if (this.valueArray[index] === 9)
                        return;
                    this.valueArray[index] += 1;
                }
                break;
            case 'minus':
                if (this.independent) {
                    if (this.valueArray[index] === 0)
                        return;
                    this.valueArray[index] -= 1;
                }
                else {
                    if (index !== 0 && this.valueArray[index] === 0 && this.valueArray[index - 1] !== 0) {
                        // cross tens
                        this.valueArray[index] = 9;
                        this.valueArray[index - 1] -= 1;
                        break;
                    }
                    // regular minus
                    if (this.valueArray[index] === 0)
                        return;
                    this.valueArray[index] -= 1;
                }
                break;
        }
        this.requestUpdate();
        this._onChange();
    }
    _disableButtons(index, edge) {
        if (this.independent) {
            return this.valueArray[index] === edge;
        }
        if (index === this.valueArray.length - 1) {
            // last
            if (this.valueArray[index] === edge && this.valueArray.every(n => n === edge))
                return true;
        }
        else if (index > 0 && index < this.valueArray.length - 1) {
            // any middle
            if (this.valueArray[index] === edge && this.valueArray[index - 1] === edge)
                return true;
        }
        else if (index === 0) {
            // first
            if (this.valueArray[index] === edge)
                return true;
        }
        return false;
    }
    _onChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                id: this.id,
                name: this.name,
                value: Number(this.valueArray.join('')),
            },
        }));
    }
    render() {
        return html `
			<style>
				${this.valueArray.length > 1
            ? css `
							.input-group:nth-child(n + 2) .number-display {
								border-left: 0;
							}
							.input-group:nth-child(n + 2):not(:last-child) .number-display {
								border-radius: 0;
							}
							.input-group:last-child .number-display {
								border-top-left-radius: 0;
								border-bottom-left-radius: 0;
							}
							.input-group:nth-child(1) .number-display {
								border-top-right-radius: 0;
								border-bottom-right-radius: 0;
							}
					  `
            : ''}
			</style>

			<div class="input-container">
				${this.valueArray.map((val, index) => html `
						<div class="input-group">
							<button
								@click=${() => this._changeValue('plus', index)}
								class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
								.disabled=${this._disableButtons(index, 9)}
							>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.PLUS}.svg`)}" alt="icon" draggable="false" />
							</button>

							<div class="number-display size--${this.size}">${val}</div>

							<button
								@click=${() => this._changeValue('minus', index)}
								class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
								.disabled=${this._disableButtons(index, 0)}
							>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.MINUS}.svg`)}" alt="icon" draggable="false" />
							</button>
						</div>
					`)}
			</div>
		`;
    }
};
InputDigit.styles = [
    ...ButtonSquare.styles,
    css `
			.input-container {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.input-group {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}

			.number-display {
				background-color: white;
				display: flex;
				justify-content: center;
				align-items: center;
				color: var(--color-midnight);
				border: 1px solid;
				border-color: var(--color-heather);
				border-radius: 4px;
				font-weight: 600;
			}

			/* sizes */

			/* medium */
			.number-display.size--medium {
				font-size: 20px;
				width: 40px;
				height: 40px;
			}

			button.size--medium {
				width: 24px;
				height: 24px;
				min-height: 24px;
			}
			button.size--medium.environment--settings {
				width: calc(var(--px-rem-ratio) * 24);
				height: calc(var(--px-rem-ratio) * 24);
				min-height: calc(var(--px-rem-ratio) * 24);
			}

			button.size--medium img {
				width: 12px;
				height: 12px;
			}

			button.size--medium.environment--settings img {
				width: calc(var(--px-rem-ratio) * 12);
				height: calc(var(--px-rem-ratio) * 12);
			}

			/* large */
			.number-display.size--large {
				font-size: 32px;
				width: 56px;
				height: 64px;
			}

			button.size--large {
				width: 40px;
				height: 40px;
				min-height: 40px;
			}
			button.size--large.environment--settings {
				width: calc(var(--px-rem-ratio) * 40);
				height: calc(var(--px-rem-ratio) * 40);
				min-height: calc(var(--px-rem-ratio) * 40);
			}

			button.size--large img {
				width: 24px;
				height: 24px;
			}

			button.size--large.environment--settings img {
				width: calc(var(--px-rem-ratio) * 24);
				height: calc(var(--px-rem-ratio) * 24);
			}

			/* borders */
			.input-group > :first-child {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				box-shadow: none;
			}
			.input-group > :last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}
		`,
];
__decorate([
    property({ type: String })
], InputDigit.prototype, "id", void 0);
__decorate([
    property({ type: String })
], InputDigit.prototype, "name", void 0);
__decorate([
    property({ type: Boolean })
], InputDigit.prototype, "independent", void 0);
__decorate([
    property({ type: Number })
], InputDigit.prototype, "value", void 0);
__decorate([
    property({ type: Array })
], InputDigit.prototype, "valueArray", void 0);
__decorate([
    property({ type: String })
], InputDigit.prototype, "size", void 0);
__decorate([
    property({ type: Number })
], InputDigit.prototype, "digitLength", void 0);
__decorate([
    property({ type: Array })
], InputDigit.prototype, "inputs", void 0);
__decorate([
    property({ type: String })
], InputDigit.prototype, "environment", void 0);
__decorate([
    property({ type: Array })
], InputDigit.prototype, "inputElements", void 0);
InputDigit = __decorate([
    customElement('gynzy-input-digit')
], InputDigit);

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IE11 doesn't support classList on SVG elements, so we emulate it with a Set
class ClassList {
    constructor(element) {
        this.classes = new Set();
        this.changed = false;
        this.element = element;
        const classList = (element.getAttribute('class') || '').split(/\s+/);
        for (const cls of classList) {
            this.classes.add(cls);
        }
    }
    add(cls) {
        this.classes.add(cls);
        this.changed = true;
    }
    remove(cls) {
        this.classes.delete(cls);
        this.changed = true;
    }
    commit() {
        if (this.changed) {
            let classString = '';
            this.classes.forEach((cls) => classString += cls + ' ');
            this.element.setAttribute('class', classString);
        }
    }
}
/**
 * Stores the ClassInfo object applied to a given AttributePart.
 * Used to unset existing values when a new ClassInfo object is applied.
 */
const previousClassesCache = new WeakMap();
/**
 * A directive that applies CSS classes. This must be used in the `class`
 * attribute and must be the only part used in the attribute. It takes each
 * property in the `classInfo` argument and adds the property name to the
 * element's `class` if the property value is truthy; if the property value is
 * falsey, the property name is removed from the element's `class`. For example
 * `{foo: bar}` applies the class `foo` if the value of `bar` is truthy.
 * @param classInfo {ClassInfo}
 */
const classMap = directive((classInfo) => (part) => {
    if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
        part.committer.name !== 'class' || part.committer.parts.length > 1) {
        throw new Error('The `classMap` directive must be used in the `class` attribute ' +
            'and must be the only part in the attribute.');
    }
    const { committer } = part;
    const { element } = committer;
    let previousClasses = previousClassesCache.get(part);
    if (previousClasses === undefined) {
        // Write static classes once
        // Use setAttribute() because className isn't a string on SVG elements
        element.setAttribute('class', committer.strings.join(' '));
        previousClassesCache.set(part, previousClasses = new Set());
    }
    const classList = (element.classList || new ClassList(element));
    // Remove old classes that no longer apply
    // We use forEach() instead of for-of so that re don't require down-level
    // iteration.
    previousClasses.forEach((name) => {
        if (!(name in classInfo)) {
            classList.remove(name);
            previousClasses.delete(name);
        }
    });
    // Add or remove classes based on their classMap value
    for (const name in classInfo) {
        const value = classInfo[name];
        if (value != previousClasses.has(name)) {
            // We explicitly want a loose truthy check of `value` because it seems
            // more convenient that '' and 0 are skipped.
            if (value) {
                classList.add(name);
                previousClasses.add(name);
            }
            else {
                classList.remove(name);
                previousClasses.delete(name);
            }
        }
    }
    if (typeof classList.commit === 'function') {
        classList.commit();
    }
});

const PX_REM_RATIO = 1 / 9.6;

var DropdownBasic_1;
let DropdownBasic = DropdownBasic_1 = class DropdownBasic extends BaseElement {
    constructor() {
        super(...arguments);
        this.options = []; // items
        this.labels = []; // item labels
        this.id = '';
        this.name = '';
        this.placeholderText = '';
        this.placeholderIcon = '';
        this.selectedOption = '';
        this.disabled = false;
        this.position = DropdownPositions.AUTO;
        this.setPosition = DropdownPositions.BOTTOM;
        this.showDropdown = false;
        this.environment = Environments.SETTINGS;
        this.optionsStyle = {};
        this.optionsScroll = 0;
        this.optionsMaxScroll = 0;
        this.hasOverflow = false;
        this.boundWindowHandlers = new Map();
    }
    _getOffset() {
        var _a;
        // this select element
        const wrapper = (_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.custom-select-wrapper');
        if (!wrapper) {
            return { top: 0, bottom: 0 };
        }
        const rect = wrapper.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom };
    }
    connectedCallback() {
        super.connectedCallback();
        this.boundWindowHandlers.set('click', () => {
            this.showDropdown = false;
        });
        this.boundWindowHandlers.set('resize', () => {
            this.showDropdown = false;
        });
        this.boundWindowHandlers.set('dropdownOpen', (e) => {
            if (e.detail.this !== this) {
                this.showDropdown = false;
            }
        });
        for (const [eventName, handler] of this.boundWindowHandlers) {
            window.addEventListener(eventName, handler);
        }
    }
    disconnectedCallback() {
        for (const [eventName, handler] of this.boundWindowHandlers) {
            window.removeEventListener(eventName, handler);
        }
        super.disconnectedCallback();
    }
    updated(changedProperties) {
        var _a;
        super.updated(changedProperties);
        // Trigger updating scroll values once DOM is updated
        if (changedProperties.has('showDropdown') && this.showDropdown) {
            this.handleScroll((_a = this.shadowRoot) === null || _a === void 0 ? void 0 : _a.querySelector('.custom-options'));
        }
    }
    positionDropDown() {
        const { top, bottom } = this.getMaxSpace();
        if (this.position === 'auto') {
            const position = this._decidePositionAuto(bottom, top);
            this.setPosition = position;
        }
        else {
            this.setPosition = this.position;
        }
        const maxOptionsHeight = this.getMaxOptionsHeight(this.setPosition, bottom, top);
        this.optionsStyle =
            maxOptionsHeight !== null
                ? {
                    'max-height': `${maxOptionsHeight}px`,
                }
                : {};
        this.hasOverflow = maxOptionsHeight !== null;
    }
    get customOptionsWrapperCssClasses() {
        const classes = [];
        switch (this.setPosition) {
            case DropdownPositions.TOP:
                classes.push('top');
                break;
            case DropdownPositions.BOTTOM:
                classes.push('bottom');
                break;
        }
        if (this.optionsScroll > 0) {
            classes.push('arrow-up');
        }
        if (this.optionsScroll < this.optionsMaxScroll) {
            classes.push('arrow-down');
        }
        return classes.join(' ');
    }
    render() {
        var _a;
        return html `
			<div
				class="custom-select-wrapper environment--${this.environment}"
				@click=${(e) => this._showDrop(e)}
				@keydown=${(e) => this._showDrop(e)}
			>
				<div class="custom-select ${this.showDropdown ? 'open' : 'closed'}">
					<div
						class="custom-select__trigger ${this.setPosition === DropdownPositions.TOP ? 'top' : 'bottom'} ${this
            .disabled
            ? 'disabled'
            : ''}"
					>
						<span
							>${this.selectedOption
            ? (_a = this.labels[this.options.indexOf(this.selectedOption)]) !== null && _a !== void 0 ? _a : this.options[this.options.indexOf(this.selectedOption)]
            : this.placeholderText}</span
						>
						<div class="arrow">
							<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16">
								<g fill="none" fill-opacity="1" fill-rule="evenodd">
									<rect width="100%" height="100%" fill="none"></rect>
									<path
										fill="#000000"
										class="icon--graphics"
										d="M3.25574396,3.34506952 L8,8.08932556 L12.744256,3.34506952 C13.0280866,3.06123896 13.3974661,2.90063916 13.8012783,2.90063916 C14.2050905,2.90063916 14.57447,3.06123896 14.8583006,3.34506952 L15.5555696,4.04233855 C15.8394002,4.32616911 16,4.69554865 16,5.09936084 C16,5.50317303 15.8394002,5.87255256 15.5555696,6.15638312 L9.05702228,12.6549305 C8.77319172,12.938761 8.40381219,13.0993608 8,13.0993608 C7.59618781,13.0993608 7.22680828,12.938761 6.94297772,12.6549305 L0.444430359,6.15638312 C0.160599797,5.87255256 0,5.50317303 0,5.09936084 C0,4.69554865 0.160599797,4.32616911 0.444430359,4.04233855 L1.14169939,3.34506952 C1.42552995,3.06123896 1.79490948,2.90063916 2.19872167,2.90063916 C2.60253386,2.90063916 2.9719134,3.06123896 3.25574396,3.34506952 Z"
									></path>
								</g>
							</svg>
						</div>
					</div>
					<div class="custom-options-wrapper ${this.customOptionsWrapperCssClasses}">
						<div
							class="custom-options ${classMap({ 'has-overflow': this.hasOverflow })}"
							style=${styleMap(this.optionsStyle)}
							@scroll=${this.handleScrollEvent}
						>
							${this.options.map((value, index) => {
            var _a;
            return html `
										<span
											class="custom-option ${this.selectedOption === value ? 'selected' : ''}"
											@click=${() => this._onSelectChange(value)}
											@keydown=${() => this._onSelectChange(value)}
											>${(_a = this.labels[index]) !== null && _a !== void 0 ? _a : value}</span
										>
									`;
        })}
						</div>
					</div>
				</div>
			</div>
		`;
    }
    handleScrollEvent(event) {
        if (event.target instanceof HTMLElement) {
            this.handleScroll(event.target);
        }
    }
    handleScroll(optionsElement) {
        if (!optionsElement) {
            return;
        }
        const { scrollTop } = optionsElement;
        this.optionsScroll = scrollTop;
        this.optionsMaxScroll = optionsElement.scrollHeight - optionsElement.clientHeight;
    }
    static getPixelSize(value) {
        const remSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
        return value * PX_REM_RATIO * remSize;
    }
    static get optionHeight() {
        return DropdownBasic_1.getPixelSize(DropdownBasic_1.OPTION_HEIGHT);
    }
    static get triggerHeight() {
        // +2 for 1px border on top and bottom
        return DropdownBasic_1.optionHeight + 2;
    }
    /**
     * Total height including trigger box.
     */
    get expandedSelectHeight() {
        // +1 for 1px border on top
        const menuHeightInPx = this.options.length * DropdownBasic_1.optionHeight + 1;
        return menuHeightInPx + DropdownBasic_1.triggerHeight;
    }
    getMaxSpace() {
        // Offset from top / bottom of window
        const { top: topOffset, bottom: bottomOffset } = this._getOffset();
        const margin = DropdownBasic_1.getPixelSize(DropdownBasic_1.DROPDOWN_WINDOW_MARGIN);
        const availableHeight = window.innerHeight;
        const maxSpaceBottom = availableHeight - topOffset - margin;
        const maxSpaceTop = bottomOffset - margin;
        return {
            bottom: maxSpaceBottom,
            top: maxSpaceTop,
        };
    }
    _decidePositionAuto(maxSpaceBottom, maxSpaceTop) {
        // Prefer bottom if its fits there
        if (maxSpaceBottom >= this.expandedSelectHeight) {
            return DropdownPositions.BOTTOM;
        }
        // Else return top if it fits there
        if (maxSpaceTop >= this.expandedSelectHeight) {
            return DropdownPositions.TOP;
        }
        // Otherwise, return the position which has the most space
        return maxSpaceBottom > maxSpaceTop ? DropdownPositions.BOTTOM : DropdownPositions.TOP;
    }
    getMaxOptionsHeight(position, maxSpaceBottom, maxSpaceTop) {
        switch (position) {
            case DropdownPositions.BOTTOM:
                // Enough space.
                if (maxSpaceBottom >= this.expandedSelectHeight) {
                    return null;
                }
                return Math.max(maxSpaceBottom - DropdownBasic_1.triggerHeight, DropdownBasic_1.optionHeight);
            case DropdownPositions.TOP:
                // Enough space
                if (maxSpaceTop >= this.expandedSelectHeight) {
                    return null;
                }
                return Math.max(maxSpaceTop - DropdownBasic_1.triggerHeight, DropdownBasic_1.optionHeight);
            default:
                return null;
        }
    }
    _onSelectChange(value) {
        this.selectedOption = value;
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                id: this.id,
                name: this.name,
                value,
            },
        }));
    }
    _showDrop(e) {
        if (this.disabled)
            return;
        e.stopPropagation();
        e.preventDefault();
        this.showDropdown = !this.showDropdown;
        if (this.showDropdown) {
            // Reset status variables
            this.optionsScroll = 0;
            this.optionsMaxScroll = 0;
            this.positionDropDown();
        }
        // emit event
        this.dispatchEvent(new CustomEvent('dropdownOpen', {
            detail: { this: this },
            bubbles: true,
            composed: true,
        }));
    }
};
DropdownBasic.OPTION_HEIGHT = 40;
DropdownBasic.DROPDOWN_WINDOW_MARGIN = 16;
DropdownBasic.styles = css `
		:host {
			--dropdown-px-rem-ratio: var(--px-rem-ratio);
			--dropdown-option-border-height: 1px; /* not in rem */
		}

		.environment--tool {
			--dropdown-px-rem-ratio: 1px;
		}

		.custom-select-wrapper {
			position: relative;
			user-select: none;
			width: 100%;
			--dropdown-option-height: calc(var(--dropdown-px-rem-ratio) * 40);
		}
		.custom-select {
			position: relative;
			display: flex;
			flex-direction: column;
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4);
		}

		.custom-select__trigger {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 0 0 calc(var(--dropdown-px-rem-ratio) * 12);
			font-size: calc(var(--dropdown-px-rem-ratio) * 16);
			font-weight: 600;
			color: var(--color-shuttle-gray);
			height: var(--dropdown-option-height);
			line-height: var(--dropdown-option-height);
			background: var(--color-white);
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4);
			border: 1px solid;
			border-color: var(--color-ghost);
			cursor: pointer;
			letter-spacing: calc(var(--dropdown-px-rem-ratio) * 0.5);
		}
		.custom-select__trigger.disabled {
			font-weight: 600;
			background: var(--color-aqua-haze);
			cursor: not-allowed;
		}
		.custom-select__trigger.disabled > span {
			opacity: 0.5;
		}
		.custom-select__trigger:not(.disabled):hover {
			color: var(--color-mariner);
		}
		.custom-select__trigger:not(.disabled):hover .icon--graphics {
			fill: var(--color-mariner);
		}
		.custom-options-wrapper {
			position: absolute;
			display: block;
			left: 0;
			right: 0;
			border: 1px solid var(--color-ghost);
			border-top: 0;
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			z-index: 2;
		}
		.custom-options {
			background: var(--color-aqua-haze);
			border-radius: inherit;
			overflow: hidden;
			white-space: nowrap;
			text-align: left;
		}
		.custom-options.has-overflow {
			overflow-y: scroll;
		}
		.custom-options-wrapper.arrow-up::before {
			pointer-events: none;
			content: ' ';
			width: 0;
			height: 0;
			border-style: solid;
			border-width: calc(var(--dropdown-px-rem-ratio) * 8);
			border-top-width: 0;
			border-color: transparent transparent var(--color-regent-gray) transparent;
			position: absolute;
			top: calc(var(--dropdown-px-rem-ratio) * 4);
			left: 50%;
			transform: translateX(-50%);
			z-index: 1;
		}

		.custom-options-wrapper.arrow-down::after {
			pointer-events: none;
			content: ' ';
			width: 0;
			height: 0;
			border-style: solid;
			border-width: calc(var(--dropdown-px-rem-ratio) * 8);
			border-bottom-width: 0;
			border-color: var(--color-regent-gray) transparent transparent transparent;
			position: absolute;
			top: calc(100% - var(--dropdown-px-rem-ratio) * 4);
			left: 50%;
			transform: translateX(-50%) translateY(-100%);
			z-index: 1;
		}

		.custom-select.open .custom-options-wrapper {
			opacity: 1;
			visibility: visible;
			pointer-events: all;
		}
		.custom-select.open,
		.custom-select.open .custom-select__trigger {
			background-color: var(--color-aqua-haze);
			color: var(--color-regent-gray);
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4) 0 0;
			z-index: 3;
			font-weight: 400;
		}
		.custom-select.open .custom-select__trigger.top {
			border-radius: 0 0 calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4);
		}
		.custom-select.open .custom-options-wrapper.bottom {
			transform: translateY(calc(40 * var(--px-rem-ratio) + var(--dropdown-option-border-height)));
			border-radius: 0 0 calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4);
		}
		.custom-select.open .custom-options-wrapper.top {
			transform: translateY(calc(-100%));
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4) 0 0;
			border-top: 1px solid var(--color-ghost);
			border-bottom: none;
		}
		.custom-option {
			position: relative;
			display: block;
			padding: 0 calc(var(--dropdown-px-rem-ratio) * 12);
			font-size: calc(var(--dropdown-px-rem-ratio) * 16);
			font-weight: 400;
			color: var(--color-midnight);
			line-height: var(--dropdown-option-height);
			height: var(--dropdown-option-height);
			cursor: pointer;
		}
		.custom-option:hover {
			cursor: pointer;
			background-color: var(--color-solitude);
		}
		.custom-option.selected {
			color: var(--color-mariner);
			font-weight: 600;
		}

		.arrow {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			width: calc(var(--dropdown-px-rem-ratio) * 40);
			border-left: 1px solid;
			border-color: var(--color-ghost);
		}

		.arrow svg {
			margin: 0 auto;
			width: calc(var(--dropdown-px-rem-ratio) * 14);
			height: calc(var(--dropdown-px-rem-ratio) * 14);
		}
		.open .arrow {
			display: none;
		}

		.icon--graphics {
			fill: var(--color-shuttle-gray);
		}
	`;
__decorate([
    property({ type: Array })
], DropdownBasic.prototype, "options", void 0);
__decorate([
    property({ type: Array })
], DropdownBasic.prototype, "labels", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "id", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "name", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "placeholderText", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "placeholderIcon", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "selectedOption", void 0);
__decorate([
    property({ type: Boolean })
], DropdownBasic.prototype, "disabled", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "position", void 0);
__decorate([
    internalProperty()
], DropdownBasic.prototype, "setPosition", void 0);
__decorate([
    internalProperty()
], DropdownBasic.prototype, "showDropdown", void 0);
__decorate([
    property({ type: String })
], DropdownBasic.prototype, "environment", void 0);
__decorate([
    internalProperty()
], DropdownBasic.prototype, "optionsStyle", void 0);
__decorate([
    internalProperty()
], DropdownBasic.prototype, "optionsScroll", void 0);
__decorate([
    internalProperty()
], DropdownBasic.prototype, "optionsMaxScroll", void 0);
__decorate([
    internalProperty()
], DropdownBasic.prototype, "hasOverflow", void 0);
DropdownBasic = DropdownBasic_1 = __decorate([
    customElement('gynzy-dropdown-basic')
], DropdownBasic);

let InputRadioColor = class InputRadioColor extends BaseElement {
    constructor() {
        super(...arguments);
        this.id = '';
        this.name = '';
        this.value = '';
        this.color = 'mariner'; // default blue
        this.checked = false;
        /**
         * input environment style
         * values:
         * tool - input is styled in px
         * settings (default) - input is styled in rem
         */
        this.environment = Environments.SETTINGS;
    }
    render() {
        return html `
			<style>
				input:checked + svg #radiobtn_inside {
					fill: var(--color-${this.color});
				}
				input:not(:checked) + svg #radiobtn_inside {
					fill: var(--color-${this.color});
					opacity: 1;
				}
			</style>

			<label class="environment--${this.environment} color--${this.color}">
				<input type="radio" .id="${this.id}" .value=${this.value} .checked=${this.checked} @change=${this.onChange} />
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 20 20"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
				>
					<g id="Assets" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
						<g id="radiobtn">
							<circle id="radiobtn_outside" cx="10" cy="10" r="10"></circle>
							<circle id="radiobtn_inside" cx="10" cy="10" r="9"></circle>
							<circle id="shadow" cx="10" cy="10" r="9"></circle>
						</g>
					</g>
				</svg>
			</label>
		`;
    }
    onChange() {
        this.dispatchEvent(new CustomEvent('change', {
            detail: {
                id: this.id,
                name: this.name,
                color: this.color,
            },
        }));
    }
};
InputRadioColor.styles = css `
		label {
			font-size: calc(var(--px-rem-ratio) * 16);
			word-break: break-word;
			line-height: calc(var(--px-rem-ratio) * 24);
			font-family: var(--font-family-base);
			font-weight: 400;
			color: var(--color-shuttle-gray);
			display: flex;
			cursor: pointer;
			user-select: none;
			width: fit-content;
			min-width: calc(var(--px-rem-ratio) * 32);
		}

		svg {
			width: calc(var(--px-rem-ratio) * 32);
			height: calc(var(--px-rem-ratio) * 32);

			border: 0.32rem solid transparent;
			border-radius: 50%;
		}

		/* PX units for tool env */
		label.environment--tool {
			font-size: 16px;
			line-height: 24px;
			min-width: 32px;
		}

		.environment--tool > svg {
			width: 32px;
			height: 32px;
			border: 2px solid transparent;
		}

		.color--white > svg #radiobtn_inside {
			stroke: var(--color-heather);
			stroke-width: 1px;
		}

		svg #radiobtn_outside {
			fill: var(--color-white);
		}
		svg #radiobtn_inside {
			fill: var(--color-alabaster);
		}
		label input {
			display: none;
		}
		input:checked + svg {
			border-color: var(--color-mariner);
		}

		#shadow {
			clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
			fill: black;
			opacity: 0.05;
		}
	`;
__decorate([
    property({ type: String })
], InputRadioColor.prototype, "id", void 0);
__decorate([
    property({ type: String })
], InputRadioColor.prototype, "name", void 0);
__decorate([
    property({ type: String })
], InputRadioColor.prototype, "value", void 0);
__decorate([
    property({ type: String })
], InputRadioColor.prototype, "color", void 0);
__decorate([
    property({ type: Boolean })
], InputRadioColor.prototype, "checked", void 0);
__decorate([
    property({ type: String })
], InputRadioColor.prototype, "environment", void 0);
InputRadioColor = __decorate([
    customElement('gynzy-input-radio-color')
], InputRadioColor);

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const previousValues = new WeakMap();
/**
 * For AttributeParts, sets the attribute if the value is defined and removes
 * the attribute if the value is undefined.
 *
 * For other part types, this directive is a no-op.
 */
const ifDefined = directive((value) => (part) => {
    const previousValue = previousValues.get(part);
    if (value === undefined && part instanceof AttributePart) {
        // If the value is undefined, remove the attribute, but only if the value
        // was previously defined.
        if (previousValue !== undefined || !previousValues.has(part)) {
            const name = part.committer.name;
            part.committer.element.removeAttribute(name);
        }
    }
    else if (value !== previousValue) {
        part.setValue(value);
    }
    previousValues.set(part, value);
});

let InputText = class InputText extends BaseElement {
    constructor() {
        super();
        this.id = '';
        this.name = '';
        this.value = '';
        this.placeholder = '';
        this.label = '';
        this.showPlaceholder = true;
        this.size = 'medium'; // "large" (not yet styled)
        this.disabled = false;
        this.maxLength = 0;
        this.maxWidth = '';
        this.hasLabel = true;
        this.isNullable = false;
        this.isPastable = false;
        this.addEventListener('focus', this._handleFocus);
        this.addEventListener('blur', this._handleBlur);
    }
    render() {
        return html `
			${!!this.maxWidth
            ? html `
						<style>
							div.iwb-container {
								width: ${this.maxWidth};
							}
						</style>
				  `
            : nothing}
			${this.hasLabel && this.label !== ''
            ? html `<gynzy-settings-label class="label">${this.label}</gynzy-settings-label>`
            : nothing}
			<div class="iwb-container">
				<input
					class="input-with-buttons ${this.size}"
					maxlength=${ifDefined(this.maxLength > 0 ? this.maxLength : undefined)}
					.id=${this.id}
					.name=${this.name}
					.value=${this.value}
					placeholder=${ifDefined(this.showPlaceholder ? this.placeholder : undefined)}
					.disabled=${this.disabled}
					@input=${this._onInputChange}
				/>
				${this.isNullable && this.value.length > 0
            ? html `
							<button @click=${this._nullInput}>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.CLEAR_INPUT}.svg`)}" alt="input-icon" />
							</button>
					  `
            : nothing}
				${this.isPastable && this.value.length === 0
            ? html `
							<button @click=${this._pasteIntoInput}>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.COPY_PASTE}.svg`)}" alt="input-icon" />
							</button>
					  `
            : nothing}
			</div>
		`;
    }
    _onInputChange(event) {
        this.value = event.target.value;
        this._onChange();
    }
    _handleFocus() {
        this.showPlaceholder = false;
    }
    _handleBlur() {
        this.showPlaceholder = true;
    }
    _nullInput() {
        this.value = '';
        this._onChange();
    }
    _pasteIntoInput() {
        navigator.clipboard.readText().then(text => {
            if (text !== '')
                this.value = text.trim();
            this._onChange();
            return false;
        });
    }
    _onChange() {
        this.dispatchEvent(new CustomEvent('inputChange', {
            detail: {
                id: this.id,
                name: this.name,
                value: this.value,
            },
        }));
    }
};
InputText.styles = css `
		div.iwb-container {
			display: flex;
			flex-direction: row;

			border: 1px solid;
			border-color: var(--color-heather);
			border-radius: 4px;
		}

		div.iwb-container > input {
			flex-grow: 2;
			border: none;
			border-radius: 4px;

			font-family: var(--font-family-base);
			color: var(--color-midnight);
			font-weight: 400;
			padding: calc(var(--px-rem-ratio) * 8) calc(var(--px-rem-ratio) * 12);
			line-height: calc(var(--px-rem-ratio) * 24);
			font-size: calc(var(--px-rem-ratio) * 16);
			outline: 0;

			width: 100%;
		}

		div.iwb-container:focus-within {
			outline: none;
			border-color: var(--color-mariner);
		}

		div.iwb-container > button {
			font-size: calc(var(--px-rem-ratio) * 16);
			cursor: pointer;
			margin: 0;
			padding: 0 calc(var(--px-rem-ratio) * 12);
			background: none;
			border: none;
			line-height: 0;
			filter: var(--color-filter-shuttle-gray);
			outline: 0;
		}
		div.iwb-container > button > img {
			width: calc(var(--px-rem-ratio) * 12);
		}

		/* small size */
		div.iwb-container > input.small {
			padding: calc(var(--px-rem-ratio) * 7) calc(var(--px-rem-ratio) * 8);
			line-height: calc(var(--px-rem-ratio) * 18);
			font-size: calc(var(--px-rem-ratio) * 12);
			vertical-align: middle;
		}
		div.iwb-container > button {
			font-size: calc(var(--px-rem-ratio) * 12);
			padding: 0 1.5rem;
		}

		.label {
			display: block;
			margin-bottom: calc(var(--px-rem-ratio) * 8);
		}
	`;
__decorate([
    property({ type: String })
], InputText.prototype, "id", void 0);
__decorate([
    property({ type: String })
], InputText.prototype, "name", void 0);
__decorate([
    property({ type: String })
], InputText.prototype, "value", void 0);
__decorate([
    property({ type: String })
], InputText.prototype, "placeholder", void 0);
__decorate([
    property({ type: String })
], InputText.prototype, "label", void 0);
__decorate([
    property({ type: Boolean })
], InputText.prototype, "showPlaceholder", void 0);
__decorate([
    property({ type: String })
], InputText.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], InputText.prototype, "disabled", void 0);
__decorate([
    property({ type: Number })
], InputText.prototype, "maxLength", void 0);
__decorate([
    property({ type: String })
], InputText.prototype, "maxWidth", void 0);
__decorate([
    property({ type: Boolean })
], InputText.prototype, "hasLabel", void 0);
__decorate([
    property({ type: Boolean })
], InputText.prototype, "isNullable", void 0);
__decorate([
    property({ type: Boolean })
], InputText.prototype, "isPastable", void 0);
InputText = __decorate([
    customElement('gynzy-input-text')
], InputText);

let SettingsLabel = class SettingsLabel extends BaseElement {
    render() {
        return html ` <label><slot></slot></label> `;
    }
};
SettingsLabel.styles = css `
		label {
			display: block;
			font-size: calc(var(--px-rem-ratio) * 16);
			color: var(--color-riverbed);
			word-break: break-word;
			line-height: calc(var(--px-rem-ratio) * 24);
			font-weight: 600;
		}
	`;
SettingsLabel = __decorate([
    customElement('gynzy-settings-label')
], SettingsLabel);

export { BaseSettings, BaseTool, __decorate, css, customElement, html, property };
//# sourceMappingURL=base-tool.js.map
