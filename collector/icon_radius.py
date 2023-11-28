from PIL import Image, ImageDraw
import numpy as np

# Load the image
img = Image.open('favicon.ico')
upper = 8
# upscale to 300x300
img = img.resize((256 + upper * 2, 256 + upper * 2), Image.ANTIALIAS)
imgarr = np.array(img)
length = imgarr.shape[0]
imgarr[:, upper // 2:length // 2] = imgarr[:, :length // 2 - upper // 2]
imgarr[:, -length // 2:-upper // 2] = imgarr[:, length // 2 + upper // 2:]
img = Image.fromarray(imgarr)
img = Image.fromarray(np.array(img)[upper:-upper, upper:-upper])

radius = 48

for I in range(radius * 2):
    for J in range(radius * 2):
        i = I
        j = J
        if (i - radius) ** 2 + (j - radius) ** 2 > radius ** 2:
            # in outside of circle
            if i > radius:
                i = i - radius * 2 + img.size[0]
            if j > radius:
                j = j - radius * 2 + img.size[1]
            # print(img.size, i, j)
            img.putpixel((i, j), (255, 255, 255, 0))

# Save the result
img.save('path_to_your_rounded_image.png', optimize = True, quality = 15)
