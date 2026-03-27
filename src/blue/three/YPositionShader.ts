const yPositionShader = {
  uniforms: {},
  vertexShader: `
        varying float yPosition;

				void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          yPosition = modelMatrix[3].y;
				}`,

  fragmentShader: `
        varying float yPosition;
				void main() {

					// float depthTest = 1.0 - (floor(yPosition) / 450.0);
					float depthTest = 1.0 - (yPosition / 450.0);
					gl_FragColor = vec4(depthTest, depthTest, depthTest, 1.0);

				}`,
};

export { yPositionShader };
