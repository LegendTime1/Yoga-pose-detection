import cv2
import numpy as np
import os
def resize_image(img, size):

    h, w = img.shape[:2] #image shape is a tuple (height,width, channel)
    c = img.shape[2] if len(img.shape)>2 else 1 #c = channel

    if h == w: 
        return cv2.resize(img, size, cv2.INTER_AREA) #Interpolation method set to cv2.INTER_AREA which is suitable for downscaling

    dif = h if h > w else w #larger of the height/width is set as dif

    #The interpolation method is set to cv2.INTER_AREA if dif is larger 
    #than the average of the desired size dimensions. 
    #Otherwise, it is set to cv2.INTER_CUBIC, which is suitable for upscaling.
    
    interpolation = cv2.INTER_AREA if dif > (size[0]+size[1])//2 else cv2.INTER_CUBIC

    x_pos = (dif - w)//2
    y_pos = (dif - h)//2

    if len(img.shape) == 2:#if image is greyscale (single channel)
        mask = np.zeros((dif, dif), dtype=img.dtype)
        mask[y_pos:y_pos+h, x_pos:x_pos+w] = img[:h, :w]
    else: #if image has colour channels
        mask = np.zeros((dif, dif, c), dtype=img.dtype)
        mask[y_pos:y_pos+h, x_pos:x_pos+w, :] = img[:h, :w, :]

    return cv2.resize(mask, size, interpolation)

if __name__ == "__main__":
    src_path = 'updated_data/7.Adho Mukha Svanasana/'
    dst_path = 'updated_data/Resized_images/'

    files = os.listdir(src_path)
    #Reads images from src_path using opencv resizes them to a 750x750 size
    #and saves them to dst_path
    for file in files:
        print(file)
        f_path = src_path+file
        img = cv2.imread(f_path) #cv2.imread reads a n-dimensional numpy array
        img = resize_image(img,size=(750,750)) 
        cv2.imwrite(dst_path+file,img)

