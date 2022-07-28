function prettify(input) {
  // taken from https://github.com/evan-brass/regex-html
  // improvement: handling self closing tag, return prettify string

  const VOID_TAGS = [
    'area', 'base', 'basefont', 'br', 'col', 'command', 'embed', 'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'stop', 'use'
  ];
  const BREAK_TAGS = [
    'blockquote', 'body', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'hr', 'link', 'meta', 'p', 'table', 'td', 'title', 'tr', 'nav', 'section', 'header', 'footer', 'main', 'aside', 'article', 'address'
  ];

  const vtag = tag => VOID_TAGS.includes(tag.toLowerCase());
  const btag = tag => BREAK_TAGS.includes(tag.toLowerCase());

  const root = {
    children: []
  };

  function pull(regex, handler = () => { }) {
    const match = regex.exec(input);
    if (match !== null) {
      const [full_match, ...captures] = match;
      input = input.substr(full_match.length);
      handler(...captures);
      return full_match;
    } else {
      return false;
    }
  }

  function parse_content(cursor) {
    let run = true;
    while (run && input.length > 0) {
      // Parse the opening of a tag:
      const success = pull(/^<([a-zA-Z][a-zA-Z0-9\-]*)/, tag => {
        const new_tag = { tag, attributes: {}, children: [] };
        cursor.children.push(new_tag);
        let closed = parse_attributes(new_tag);
        if (closed) new_tag.closed = true;
        if (!vtag(tag) && !closed) {
          parse_content(new_tag);
        }
      })
        // Parse a closing tag
        || pull(/^<\/([a-zA-Z][a-zA-Z0-9\-]*)>/, tag => {
          if (
            cursor.tag === undefined ||
            cursor.tag.toLowerCase() !== tag.toLowerCase()
          ) {
            throw new Error("Closing tag doesn't match: " + cursor.tag);
          }
          run = false;
        })
        // Parse a text node
        || pull(/^([^<]+)/, text => {
          ttext = text.replace(/^\s+|\s+$/g, '').replace(/\n/g, ' ').replace(/ +/, ' ');
          ttext && cursor.children.push({
            text: ttext
          });
        });
      if (!success) {
        throw new Error("Parsing Error: No rules matched");
      }
    }
  }

  function parse_attributes(cursor) {
    while (pull(/^\s+([a-zA-Z][a-zA-Z0-9\-]+)(?:="([^"]*)")?/, (
      name,
      value
    ) => {
      cursor.attributes[name] = value;
    })) { }
    if (match = pull(/^\s*\/?>/)) {
      return match.endsWith('/>')
    } else {
      throw new Error("Malformed open tag");
    }
  }
  try {
    parse_content(root);
  } catch (error) {
    return false;
  }
  // return root.children;
  function format(node, level = 0) {
    let indent = "  ".repeat(level);
    if (node.text)
      return node.text;
    let result = "";
    if (level && btag(node.tag)) result += "\n" + indent;
    result += `<${node.tag} `;
    Object.keys(node.attributes).forEach(k => {
      if (node.attributes[k]) {
        result += k + '="' + node.attributes[k] + '" '
      } else {
        result += k + '"" ';
      }
    });
    result += node.closed ? " />" : ">";
    node.children.forEach(c => {
      result += format(c, level + 1)
    });
    if (btag(node.tag)) result += "\n" + indent;
    if (!node.closed && !vtag(node.tag)) {
      result += `</${node.tag}>`;
    }
    return result;
  }

  let result = '';
  root.children.forEach(e => {
    result += format(e, 0) + "\n";
  })
  result = result.replace(/ >/g, '>').replace(/ +\/>/g, ' />').replace(/(?<=[^>\s])\s+</g, "<").replace(/(\n\s+)?\n/g, "\n");
  return result;
}

class EditHtml {
  // inspired from https://github.com/benwinding/quill-html-edit-button
  constructor(quill) {
    const toolbarModule = quill.getModule("toolbar");
    if (!toolbarModule) {
      throw new Error(
        'quill.htmlEditButton requires the "toolbar" module to be included too'
      );
    }
    let bc = document.createElement('span');
    bc.setAttribute('class', 'ql-formats');
    let bt = document.createElement('button');
    bt.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M384 121.941V128H256V0h6.059c6.365 0 12.47 2.529 16.971 7.029l97.941 97.941A24.005 24.005 0 0 1 384 121.941zM248 160c-13.2 0-24-10.8-24-24V0H24C10.745 0 0 10.745 0 24v464c0 13.255 10.745 24 24 24h336c13.255 0 24-10.745 24-24V160H248zM123.206 400.505a5.4 5.4 0 0 1-7.633.246l-64.866-60.812a5.4 5.4 0 0 1 0-7.879l64.866-60.812a5.4 5.4 0 0 1 7.633.246l19.579 20.885a5.4 5.4 0 0 1-.372 7.747L101.65 336l40.763 35.874a5.4 5.4 0 0 1 .372 7.747l-19.579 20.884zm51.295 50.479l-27.453-7.97a5.402 5.402 0 0 1-3.681-6.692l61.44-211.626a5.402 5.402 0 0 1 6.692-3.681l27.452 7.97a5.4 5.4 0 0 1 3.68 6.692l-61.44 211.626a5.397 5.397 0 0 1-6.69 3.681zm160.792-111.045l-64.866 60.812a5.4 5.4 0 0 1-7.633-.246l-19.58-20.885a5.4 5.4 0 0 1 .372-7.747L284.35 336l-40.763-35.874a5.4 5.4 0 0 1-.372-7.747l19.58-20.885a5.4 5.4 0 0 1 7.633-.246l64.866 60.812a5.4 5.4 0 0 1-.001 7.879z"/></svg>';
    bt.title = 'Show HTML source';
    bt.onclick = e => {
      this.launch();
    };
    bc.appendChild(bt);
    toolbarModule.container.append(bc);
    this.quill = quill;
  }

  launch() {
    let div = new DOMParser().parseFromString(`
    <div id="htmlEdit" style="z-index:1050; background-color: #e5e7ebe6; bottom: 0; top: 0; right: 0; left: 0; position: fixed;">
      <div style="padding: 2rem 1rem; display: flex; flex-direction: column; width: 100%; height: 100%; ">
        <div style="padding: 1.25rem; flex-grow: 1;">
          <span style="color: rgb(71 85 105); margin: 0.25rem; font-style: italic; ">Edit HTML here</span>
          <textarea style="padding: 0.5rem; background-color: white; border-radius: 0.5rem; width: 100%; height: 100%; "></textarea>      
        </div>
        <div style="padding: 1rem; gap: 1rem; justify-content: center; display: flex;">
            <button id="htmlEditCancel" style="padding: 0.5rem 1rem; background-color: white; border-radius: 0.375rem">Cancel</button>
            <button id="htmlEditOk" style="padding: 0.5rem 1rem; background-color: white; border-radius: 0.375rem">Ok</button>
          </div>
      </div>
    </div>
    `, 'text/html').body.firstElementChild;
    let content = prettify(this.quill.root.innerHTML) || this.quill.root.innerHTML;
    document.body.append(div);
    let area = document.querySelector('#htmlEdit textarea')
    area.value = content;
    area.focus();
    let btnCancel = document.getElementById('htmlEditCancel');
    btnCancel.onclick = e => {
      e.preventDefault();
      document.body.removeChild(div);
    }
    document.getElementById('htmlEditOk').onclick = e => {
      e.preventDefault();
      this.quill.root.innerHTML = area.value;
      document.body.removeChild(div);
    }
  }
}