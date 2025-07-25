import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ChefHat, 
  Plus, 
  Settings, 
  Eye, 
  BookOpen, 
  Heart,
  Star,
  Share2,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  Edit3,
  Camera,
  Search,
  Filter,
  ArrowUpRight,
  BarChart2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Recipe, RecipeCardSkeleton } from '../components/RecipeCard';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [profileData, setProfileData] = useState({
    bio: 'Passionate food enthusiast and recipe creator. Sharing my culinary adventures and inspiring others to explore the joy of cooking.',
    location: 'San Francisco, CA',
    joinedDate: 'January 2024',
    website: 'https://flavourfusion.com'
  });

  const stats = {
    totalRecipes: recipes.length,
    totalViews: recipes.reduce((acc, recipe) => acc + (recipe.views || 0), 0),
    avgRating: 4.5,
    followers: 128,
    monthlyViews: 2547,
    trendingRecipes: 3
  };

  const categories = ['all', 'dessert', 'main course', 'salad', 'appetizer', 'breakfast'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/sign-in');
      return;
    }

    const fetchRecipes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/recipe/fetch/user/${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await response.json();
        
        if (data.success) {
          setRecipes(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch recipes", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipes();
  }, [user]);

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      navigate('/sign-in');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/recipe/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setRecipes(recipes.filter((recipe) => recipe._id !== data.data._id));
      }
    } catch (error) {
      console.error("Failed to delete recipe", error);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          recipe.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime();
    if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
    return 0;
  });

  return (
    <div className="min-h-screen bg-white-100">
      {/* Hero Section with Profile */}
      <section className="pink_container mb-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <img
                src={user?.profilePicture || 'https://via.placeholder.com/200'}
                alt={user?.name}
                className="w-48 h-48 rounded-full border-4 border-white shadow-xl object-cover"
              />
              <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <Camera className="h-5 w-5 text-primary" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-30-extrabold text-white mb-1">{user?.name}</h1>
                  <p className="text-20-medium text-white opacity-90">
                    @{user?.email.split('@')[0]}
                  </p>
                </div>
                {isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="startup-card_btn !bg-white !text-black hover:!bg-black hover:!text-white"
                  >
                    Save Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="startup-card_btn !bg-white !text-black hover:!bg-black hover:!text-white flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="w-full p-3 rounded-lg border-2 border-white bg-white bg-opacity-10 text-white placeholder-white-100 mb-4"
                  rows={3}
                />
              ) : (
                <p className="text-16-medium text-white opacity-80 mb-4 max-w-2xl">
                  {profileData.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-6 mb-6 text-white opacity-80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${user?.email}`} className="hover:text-white">{user?.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {profileData.joinedDate}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  to="/create"
                  className="startup-card_btn !bg-white !text-black hover:!bg-black hover:!text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Recipe
                </Link>
                <button className="startup-card_btn !bg-white !text-black hover:!bg-black hover:!text-white flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="startup-card text-center transform hover:scale-105 transition-transform">
            <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-30-bold">{stats.totalRecipes}</p>
            <p className="text-16-medium text-black-100">Recipes</p>
          </div>
          <div className="startup-card text-center transform hover:scale-105 transition-transform">
            <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-30-bold">{stats.totalViews}</p>
            <p className="text-16-medium text-black-100">Total Views</p>
          </div>
          <div className="startup-card text-center transform hover:scale-105 transition-transform">
            <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-30-bold">{stats.followers}</p>
            <p className="text-16-medium text-black-100">Followers</p>
          </div>
          <div className="startup-card text-center transform hover:scale-105 transition-transform">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-30-bold">{stats.avgRating}</p>
            <p className="text-16-medium text-black-100">Avg Rating</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="startup-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-18-bold">Monthly Views</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-30-bold text-primary">{stats.monthlyViews}</p>
            <p className="text-16-medium text-black-100">+12.5% from last month</p>
          </div>
          
          <div className="startup-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-18-bold">Trending Recipes</h3>
              <BarChart2 className="h-5 w-5 text-primary" />
            </div>
            <p className="text-30-bold text-primary">{stats.trendingRecipes}</p>
            <p className="text-16-medium text-black-100">Recipes in top 100</p>
          </div>
          
          <div className="startup-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-18-bold">Profile Views</h3>
              <ArrowUpRight className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-30-bold text-primary">847</p>
            <p className="text-16-medium text-black-100">Last 30 days</p>
          </div>
        </div>
      </section>

      {/* Recipe Management */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-30-bold">Your Recipes</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="startup-form_input w-24 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="startup-card_btn flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="startup-form_input"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="startup-card p-4">
              <div className="flex flex-wrap gap-4">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full border-2 transition-colors ${
                      selectedCategory === category
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-gray-200 hover:border-primary'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recipe Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <RecipeCardSkeleton key={n} />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <div key={recipe._id} className="startup-card group">
                  <div className="relative h-48 rounded-[10px] overflow-hidden mb-4 border-[3px] border-black">
                    <img
                      src={recipe.imageURL}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        className="p-2 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                        onClick={() => handleDelete(recipe._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-20-medium mb-2">{recipe.title}</h3>
                  <p className="startup-card_desc">{recipe.description}</p>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-16-medium text-primary bg-primary-50 px-3 py-1 rounded-full">
                      {recipe.category}
                    </span>
                    <div className="flex items-center gap-2 text-black-100">
                      <Eye className="h-4 w-4" />
                      <span>{recipe.views} views</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-black-100/10">
                    <Link
                      to={`/recipe/view/${recipe._id}`}
                      className="text-16-medium text-primary hover:underline"
                    >
                      View Recipe
                    </Link>
                    <button className="p-2 hover:bg-primary-50 rounded-full transition-colors">
                      <Share2 className="h-5 w-5 text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredRecipes.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-primary mx-auto mb-4" />
              <p className="text-20-medium mb-4">No recipes found</p>
              <Link
                to="/create"
                className="startup-card_btn inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Recipe
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;