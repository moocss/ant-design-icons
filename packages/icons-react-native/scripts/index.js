const build = require('buildfont/src/executing');
const path = require('path');
const fs = require('fs-extra');
const prettier = require('prettier');


// TODO: twotone
const fonts = ['fill', 'outline'];
const upperName = name => name.charAt(0).toUpperCase() + name.slice(1);

// TODO: move to ../icons/build
fs.ensureDirSync('fonts');
fs.ensureDirSync('iconfont');
fonts.forEach(name => {
  const fontName = `ant${name}`;
  const uppercaseName = upperName(name);
  const svgFolder = path.resolve(process.cwd(), '../icons/svg/', name);
  const dist = `iconfont/${name}`;
  build(svgFolder, fontName, dist).then(() => {
    const json = fs.readFileSync(path.join(dist, `${fontName}.json`), 'utf-8');
    fs.copyFileSync(
        path.join(dist, `${fontName}.ttf`), `fonts/${fontName}.ttf`);
    // TODO: template
    const content = `

// tslint:disable
import * as React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
export const ${name}GlyphMap = ${json};

export type ${uppercaseName}GlyphMapType = keyof typeof ${name}GlyphMap;

export interface Icon${uppercaseName}Props extends TextProps {
	name: ${uppercaseName}GlyphMapType;
	size?: number;
	color?: string
}

export default class Icon${uppercaseName} extends React.PureComponent<Icon${
        uppercaseName}Props> {
  render() {
    const {
      name,
      style,
      children,
      size = 14,
      color = "black",
      ...props
    } = this.props;
    const styleOverrides: TextStyle = {
      fontFamily: "antfill",
      fontWeight: "normal",
      fontStyle: "normal",
      fontSize: size,
      color
    };
    let glyph = name ? ${name}GlyphMap[name] || "?" : "";
    if (typeof glyph === "number") {
      glyph = String.fromCharCode(glyph);
    }
    return (
      <Text {...props} style={[styleOverrides, style]}>
        {glyph}
        {children}
      </Text>
    );
  }
}

		`;

    fs.writeFileSync(
        `src/${name}.tsx`, prettier.format(content, {parser: 'typescript'}));
  });
});

// index.tsx
const contents = fonts.map(font => {
  return `export { default as Icon${upperName(font)} } from './${font}';\n`;
});

fs.writeFileSync('src/index.tsx', contents.join(''))
