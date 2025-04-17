import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar, ActivityIndicator, Alert } from "react-native";
import { fetchBooks } from "../helpers/fetchBooks";
import { useNavigation } from "@react-navigation/native";

const BooksScreen = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadBooks = async () => {
      setLoading(true);
      try {
        const booksData = await fetchBooks();
        setBooks(booksData);
      } catch (error) {
        console.error("Error loading books:", error);
        Alert.alert("Error", "Failed to load books. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const handleReadBook = (book) => {
    // Check if we have a download URL
    if (!book.downloadURL) {
      // If no downloadURL, just pass the book ID
      navigation.navigate("BookReader", { 
        bookId: book.id,
        bookTitle: book.title 
      });
    } else {
      // If we have a downloadURL, pass it directly
      navigation.navigate("BookReader", { 
        pdfUrl: book.downloadURL,
        bookId: book.id,
        bookTitle: book.title 
      });
    }
  };

  const renderBookItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.bookCard, { marginLeft: index % 2 === 0 ? 0 : 8, marginRight: index % 2 === 0 ? 8 : 0 }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate("BookDetails", { book: item })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.imageURL }} 
          style={styles.bookImage}
          // defaultSource={require('../assets/images/book-placeholder.png')} // Add a placeholder image
        />
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{item.rating || "4.5"}</Text>
        </View>
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.author}>{item.author}</Text>
        <TouchableOpacity
          style={styles.readButton}
          onPress={() => handleReadBook(item)}
        >
          <Text style={styles.readButtonText}>Read Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const ListHeaderComponent = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Sex Education</Text>
      <Text style={styles.headerSubtitle}>Quality resources for informed decisions</Text>
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate("SearchScreen")}
      >
        <View style={styles.searchIconContainer}>
          <Text style={styles.searchIconPlaceholder}>🔍</Text>
        </View>
        <Text style={styles.searchPlaceholder}>Search topics, resources...</Text>
      </TouchableOpacity>
      
      
    </View>
  );

  // Scrollable category component for header
  const ScrollableCategory = ({ title, emoji }) => (
    <TouchableOpacity style={styles.categoryButton}>
      <Text style={styles.categoryEmoji}>{emoji}</Text>
      <Text style={styles.categoryText}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading && books.length === 0) {
    return (
      <View style={styles.loadingFullScreen}>
        <ActivityIndicator size="large" color="#FF5E85" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF5E85" />
      <FlatList
        data={books}
        keyExtractor={(item) => item.id || String(Math.random())}
        renderItem={renderBookItem}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No resources found</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => loadBooks()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F5", // Light pink background
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
    backgroundColor: "#FF5E85", // "Sex Education" show's vibrant pink
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 4,
    fontFamily: "System",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#ffffff",
    marginBottom: 16,
    opacity: 0.9,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 24,
    padding: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  searchIconContainer: {
    marginRight: 8,
  },
  searchIconPlaceholder: {
    fontSize: 16,
  },
  searchPlaceholder: {
    color: "#888",
    fontSize: 15,
  },
  categoriesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  categoryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FF5E85",
  },
  bookCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255, 94, 133, 0.2)", // Very light pink border
  },
  imageContainer: {
    position: "relative",
  },
  bookImage: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FF5E85",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bookInfo: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#777",
    marginBottom: 12,
  },
  readButton: {
    backgroundColor: "#FF5E85",
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: "center",
  },
  readButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadingFullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F5",
  },
  loadingText: {
    marginTop: 12,
    color: "#FF5E85",
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#FF5E85",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default BooksScreen;