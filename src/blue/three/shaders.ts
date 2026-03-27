// invert colors

export const InverseShader = {
  uniforms: {
    tDiffuse: { value: null },
  },

  vertexShader: [
    'varying vec2 vUv;',

    'void main() {',

    'vUv = uv;',

    'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',

    '}',
  ].join('\n'),

  fragmentShader: [
    '#include <common>',

    'uniform sampler2D tDiffuse;',

    'varying vec2 vUv;',

    'void main() {',

    'vec4 texel = texture2D( tDiffuse, vUv );',

    'gl_FragColor = vec4( 1.0-texel.r, 1.0-texel.g, 1.0-texel.b, texel.w );',

    '}',
  ].join('\n'),
};
