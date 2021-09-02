import * as React from 'react';

import { Text, TextProps } from './Themed';

export default function MonoText(props: TextProps) {
  // eslint-disable-next-line react/destructuring-assignment
  return <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />;
}
