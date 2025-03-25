// BookReaderScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  BackHandler,
  Alert,
  ToastAndroid,
  Platform
} from 'react-native';
import Pdf from 'react-native-pdf';
import RNFS from 'react-native-fs';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';

// Icons component (replace with your preferred icon library)
const Icon = ({ name, size = 24, color = '#000' }) => {
  // Simple icon mapping - replace with actual icons from your library
  const iconMap = {
    'back': '←',
    'download': '↓',
    'share': '↗',
    'bookmark': '🔖',
    'settings': '⚙️',
    'error': '⚠️'
  };
  
  return <Text style={{ fontSize: size, color }}>{iconMap[name] || '•'}</Text>;
};

// Show toast message helper
const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // For iOS, you might want to use a custom toast component
    console.log(message);
  }
};

const BookReaderScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { pdfUrl, bookId, bookTitle = 'Book' } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localFilePath, setLocalFilePath] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  
  // Function to check if we have a valid URL or local path
  const checkValidSource = () => {
    if (!pdfUrl && !bookId) {
      setError('No PDF source provided. Please provide a URL or book ID.');
      setLoading(false);
      return false;
    }
    return true;
  };
  
  // Function to get PDF URL from book ID if needed
  const getPdfUrlFromBookId = async (id) => {
    try {
      // This would be your API call to get the download URL from book ID
      // Mocking this for demonstration
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulating API response
          if (id) {
            resolve(`https://yourapi.com/books/${id}/download`);
          } else {
            reject(new Error('Invalid book ID'));
          }
        }, 1000);
      });
    } catch (err) {
      throw new Error(`Failed to get download URL: ${err.message}`);
    }
  };
  
  // Handle back button press
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (loading && downloadProgress > 0 && downloadProgress < 100) {
          Alert.alert(
            'Cancel Download?',
            'The book is still downloading. Are you sure you want to cancel?',
            [
              { text: 'Continue Download', style: 'cancel' },
              { text: 'Cancel Download', onPress: () => navigation.goBack() }
            ]
          );
          return true;
        }
        return false;
      };
      
      // Fix: Store the subscription and call .remove() on it
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      
      // Return a cleanup function that removes the event listener
      return () => subscription.remove();
    }, [loading, downloadProgress, navigation])
  );
  
  // Main function to download and prepare the book
  const downloadAndPrepareBook = async (url) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!url) {
        throw new Error('Invalid URL provided');
      }
      
      // Create a unique filename from the URL or use bookId
      const filename = url.split('/').pop() || 
                        `book-${bookId || Date.now()}.pdf`;
      const localPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      
      // Check if file already exists
      const exists = await RNFS.exists(localPath);
      
      if (exists) {
        console.log('File already exists locally');
        setLocalFilePath(localPath);
        setLoading(false);
        return;
      }
      
      // Download the file
      const options = {
        fromUrl: url,
        toFile: localPath,
        progress: (res) => {
          const progress = (res.bytesWritten / res.contentLength) * 100;
          setDownloadProgress(Math.round(progress));
        },
        backgroundTimeout: 30000
      };
      
      const result = await RNFS.downloadFile(options).promise;
      
      if (result.statusCode === 200) {
        console.log('File downloaded successfully');
        setLocalFilePath(localPath);
      } else {
        throw new Error(`Download failed with status code ${result.statusCode}`);
      }
    } catch (err) {
      console.error('Error downloading book:', err);
      setError(`Failed to download book: ${err.message}`);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };
  
  // Initial setup and download
  useEffect(() => {
    const initializeReader = async () => {
      if (!checkValidSource()) return;
      
      try {
        let urlToUse = pdfUrl;
        
        // If we have bookId but no URL, get URL from API
        if (!urlToUse && bookId) {
          urlToUse = await getPdfUrlFromBookId(bookId);
        }
        
        await downloadAndPrepareBook(urlToUse);
      } catch (err) {
        setError(`Failed to initialize reader: ${err.message}`);
        setLoading(false);
      }
    };
    
    initializeReader();
  }, [pdfUrl, bookId, retrying]);
  
  // Save reading progress when unmounting
  useEffect(() => {
    return () => {
      if (currentPage > 1 && totalPages > 0) {
        // Save reading progress to AsyncStorage or your preferred storage
        console.log(`Saving reading progress: ${currentPage}/${totalPages}`);
        // Implementation would go here
      }
    };
  }, [currentPage, totalPages]);
  
  const onPageChanged = (page, totalPages) => {
    setCurrentPage(page);
    setTotalPages(totalPages);
  };
  
  const handleRetry = () => {
    setRetrying(true);
    setError(null);
    setDownloadProgress(0);
    setLoading(true);
  };
  
  // Error view
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="back" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.errorContainer}>
          <Icon name="error" size={50} color="#e63946" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity 
              style={[styles.errorButton, styles.primaryButton]}
              onPress={handleRetry}
            >
              <Text style={styles.primaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.errorButton, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{bookTitle}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => showToast('Bookmark added')}
          >
            <Icon name="bookmark" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>
            {downloadProgress > 0 
              ? `Downloading... ${downloadProgress}%` 
              : 'Preparing your book...'}
          </Text>
          {downloadProgress > 0 && (
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { width: `${downloadProgress}%` }
                ]} 
              />
            </View>
          )}
        </View>
      ) : (
        <>
          {localFilePath ? (
            <>
              {/* PDF Viewer */}
              <View style={styles.pdfContainer}>
                <Pdf
                  source={{ uri: `file://${localFilePath}` }}
                  onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`PDF loaded with ${numberOfPages} pages`);
                    setTotalPages(numberOfPages);
                  }}
                  onPageChanged={(page, numberOfPages) => {
                    onPageChanged(page, numberOfPages);
                  }}
                  onError={(error) => {
                    console.error('PDF error:', error);
                    setError(`Cannot load PDF: ${error.message}`);
                  }}
                  onPressLink={(uri) => {
                    console.log(`Link pressed: ${uri}`);
                  }}
                  style={styles.pdf}
                  enablePaging={true}
                  horizontal={false}
                  enableAntialiasing={true}
                  fitPolicy={0}
                  trustAllCerts={false}
                />
              </View>
              
              {/* Footer with page info */}
              <View style={styles.footer}>
                <Text style={styles.pageInfo}>
                  Page {currentPage} of {totalPages}
                </Text>
                
                <View style={styles.footerControls}>
                  <TouchableOpacity 
                    style={styles.footerButton}
                    onPress={() => showToast('Settings')}
                  >
                    <Icon name="settings" size={20} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.footerButton}
                    onPress={() => showToast('Sharing options')}
                  >
                    <Icon name="share" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No file available to display</Text>
              <TouchableOpacity 
                style={[styles.errorButton, styles.primaryButton]}
                onPress={handleRetry}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerSpacer: {
    width: 40,
  },
  headerButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '80%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#f8f8f8',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  pageInfo: {
    fontSize: 14,
    color: '#666',
  },
  footerControls: {
    flexDirection: 'row',
  },
  footerButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  errorButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#6200ee',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default BookReaderScreen;