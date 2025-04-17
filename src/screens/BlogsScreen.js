import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput,
  StatusBar
} from "react-native";
import { db } from "../firebaseConfig"; // Import Firestore db from your firebase config
import { collection, onSnapshot } from "firebase/firestore";
import { Card, Chip } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { query, orderBy } from "firebase/firestore";


const BlogsScreen = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Featured");
  const navigation = useNavigation();

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
  
    // Set up the real-time listener to fetch blogs from Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        console.log("No blogs found.");
      } else {
        const blogsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        console.log("Fetched blogs:", blogsData); // Log fetched blogs
        setBlogs(blogsData);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error fetching blogs:", error); // Log any errors
    });
  
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      {["Featured", "Latest", "Trending"].map((tab) => (
        <TouchableOpacity 
          key={tab} 
          onPress={() => setActiveTab(tab)}
          style={[styles.tabButton, activeTab === tab ? styles.activeTabButton : null]}
        >
          <Text style={[styles.tabText, activeTab === tab ? styles.activeTabText : null]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderBlogCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => navigation.navigate("BlogDetails", { blog: item })}
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUrl || "https://images.pexels.com/photos/1133957/pexels-photo-1133957.jpeg?auto=compress&cs=tinysrgb&w=600" }} 
            style={styles.blogImage} 
          />
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category || "Lifestyle"}</Text>
          </View>
        </View>
        <Card.Content style={styles.cardContent}>
          <View style={styles.authorRow}>
            <Image 
              source={{ uri: item.authorAvatar || "https://randomuser.me/api/portraits/men/1.jpg" }} 
              style={styles.authorAvatar} 
            />
            <Text style={styles.author}>By {item.author || "Rahul"}</Text>
            <Text style={styles.dateText}>{item.date || "2 days ago"}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.content}>
            {item.content}
          </Text>
        </Card.Content>
        <Card.Actions style={styles.actions}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="heart-outline" size={20} color="#ff385c" />
            <Text style={styles.iconText}>{item.likes || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="comment-outline" size={20} color="#6c757d" />
            <Text style={styles.iconText}>{item.comments ? item.comments.length : 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="bookmark-outline" size={20} color="#6200ea" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.shareButton}>
            <Icon name="share-variant" size={18} color="#6200ea" />
          </TouchableOpacity>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity>
          <View style={styles.profileButton}>
            <Icon name="account" size={24} color="#6200ea" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#6c757d" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search articles..." 
          style={styles.searchInput} 
          placeholderTextColor="#adb5bd"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={20} color="#6200ea" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      {renderTabs()}

      {/* Blog List */}
      {blogs.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Icon name="text-box-remove-outline" size={60} color="#e0e0e0" />
          <Text style={styles.noBlogsText}>No blogs available</Text>
          <Text style={styles.noBlogsSubText}>Check back later for new content</Text>
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={blogs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={renderBlogCard}
        />
      )}

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate("CreateBlogScreen")}
      >
        <LinearGradient
          colors={['#7c4dff', '#6200ea']}
          style={styles.fabGradient}
        >
          <Icon name="plus" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#212529",
    letterSpacing: 0.5,
  },
  profileButton: {
    backgroundColor: "#f0e7fe",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#212529",
    fontSize: 16,
  },
  filterButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tabButton: {
    marginRight: 25,
    paddingBottom: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#6200ea",
  },
  tabText: {
    fontSize: 16,
    color: "#6c757d",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#6200ea",
    fontWeight: "600",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  noBlogsText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#495057",
    marginTop: 20,
  },
  noBlogsSubText: {
    fontSize: 16,
    color: "#adb5bd",
    marginTop: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  blogImage: {
    width: "100%",
    height: 180,
  },
  categoryPill: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 30,
  },
  categoryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  author: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#adb5bd",
    marginLeft: "auto",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 8,
    lineHeight: 24,
  },
  content: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f5",
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  iconText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  shareButton: {
    backgroundColor: "#f0e7fe",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#6200ea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default BlogsScreen;