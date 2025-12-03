import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Pick an image from the user's gallery
 */
export async function pickImage(): Promise<string | null> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Launch image picker with editing enabled
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Enable crop/edit UI
      aspect: [4, 3], // Aspect ratio for cropping
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error picking image:', error);
    throw error;
  }
}

/**
 * Pick multiple images from the user's gallery
 */
export async function pickMultipleImages(): Promise<string[]> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Launch image picker with multiple selection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Enable multiple selection
      quality: 0.8,
    });

    if (result.canceled) {
      return [];
    }

    return result.assets.map(asset => asset.uri);
  } catch (error) {
    console.error('Error picking multiple images:', error);
    throw error;
  }
}

/**
 * Crop an image using the image manipulator
 */
export async function cropImage(uri: string): Promise<string | null> {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [
        // No actions specified - this will open the crop interface
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error cropping image:', error);
    return null;
  }
}

/**
 * Save image to app's document directory
 */
export async function saveImageToAppDirectory(uri: string): Promise<string> {
  try {
    // Create images directory if it doesn't exist
    const imagesDir = `${(FileSystem as any).documentDirectory}images/`;
    const dirInfo = await (FileSystem as any).getInfoAsync(imagesDir);
    
    if (!dirInfo.exists) {
      await (FileSystem as any).makeDirectoryAsync(imagesDir, { intermediates: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `task_${timestamp}_${randomStr}.jpg`;
    const destPath = `${imagesDir}${filename}`;

    // Copy the image
    await (FileSystem as any).copyAsync({
      from: uri,
      to: destPath,
    });

    console.log('Image saved to:', destPath);
    return destPath;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
  }
}

/**
 * Delete an image from the app directory
 */
export async function deleteImage(uri: string): Promise<void> {
  try {
    const fileInfo = await (FileSystem as any).getInfoAsync(uri);
    
    if (fileInfo.exists) {
      await (FileSystem as any).deleteAsync(uri);
      console.log('Image deleted:', uri);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - deletion failures shouldn't break the app
  }
}

/**
 * Complete flow: pick (with crop) and save image
 */
export async function pickCropAndSaveImage(): Promise<string | null> {
  try {
    // Step 1: Pick image (with built-in crop UI)
    const pickedUri = await pickImage();
    if (!pickedUri) {
      return null;
    }

    // Step 2: Save to app directory
    const savedUri = await saveImageToAppDirectory(pickedUri);
    
    return savedUri;
  } catch (error) {
    console.error('Error in image flow:', error);
    return null;
  }
}

/**
 * Complete flow: pick multiple images and save them
 */
export async function pickAndSaveMultipleImages(): Promise<string[]> {
  try {
    // Step 1: Pick multiple images
    const pickedUris = await pickMultipleImages();
    if (pickedUris.length === 0) {
      return [];
    }

    // Step 2: Save all images to app directory
    const savedUris: string[] = [];
    for (const uri of pickedUris) {
      const savedUri = await saveImageToAppDirectory(uri);
      savedUris.push(savedUri);
    }
    
    return savedUris;
  } catch (error) {
    console.error('Error in multiple images flow:', error);
    return [];
  }
}
