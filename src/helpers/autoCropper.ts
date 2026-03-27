const isColor = (rgb) => {
  return rgb.red === 0 && rgb.green === 0 && rgb.blue === 0;
};

const getRGB = (data, image, x, y) => {
  return {
    red: data[(image.width * y + x) * 4],
    green: data[(image.width * y + x) * 4 + 1],
    blue: data[(image.width * y + x) * 4 + 2],
  };
};

const scanX = (data, image, left) => {
  const offset = left ? 1 : -1;

  for (
    let x = left ? 0 : data.width - 1;
    left ? x < data.width : x > -1;
    x += offset
  ) {
    for (let y = 0; y < data.height; y++) {
      if (!isColor(getRGB(data.data, image, x, y))) {
        return x;
      }
    }
  }

  return null;
};

const scanY = (data, image, top) => {
  const offset = top ? 1 : -1;

  for (
    let y = top ? 0 : data.height - 1;
    top ? y < data.height : y > -1;
    y += offset
  ) {
    for (let x = 0; x < data.width; x++) {
      if (!isColor(getRGB(data.data, image, x, y))) {
        return y;
      }
    }
  }

  return null;
};

export const autoCropper = (imageUrl) => {
  return new Promise(function (resolve, reject) {
    // HTML image element
    const imageElement = new Image();
    imageElement.src = imageUrl;

    imageElement.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');

      // Get the 2D rendering context of the canvas
      const ctx = canvas.getContext('2d');

      // Set the canvas dimensions to match the image element
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;

      // Draw the image onto the canvas
      ctx.drawImage(imageElement, 0, 0);

      // Get the image data from the canvas
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const top = scanY(imageData, imageElement, true);
      const bottom = scanY(imageData, imageElement, false);
      const left = scanX(imageData, imageElement, true);
      const right = scanX(imageData, imageElement, false);

      const new_width = right - left;
      const new_height = bottom - top;

      canvas.width = new_width;
      canvas.height = new_height;

      ctx.drawImage(
        imageElement,
        left,
        top,
        new_width,
        new_height,
        0,
        0,
        new_width,
        new_height
      );
      resolve(canvas.toDataURL('image/png'));
    };
  });
};
