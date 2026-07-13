import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiFilter, FiX } from 'react-icons/fi';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Loader from '../components/ProtectedRoute';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const category = searchParams.get('category') || '';
  const gender = searchParams.get('gender') || '';
  const search = searchParams.get('search') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', {
        params: { category, gender, search, bestseller, sort, page, limit: 12 },
      });
      setProducts(data.data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      // fail silently, empty state shown
    } finally {
      setLoading(false);
    }
  }, [category, gender, search, bestseller, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.data.categories)).catch(() => {});
  }, []);

  const activeFiltersCount = [category, gender, bestseller].filter(Boolean).length;

  return (
    <div className="container-max px-4 sm:px-6 lg:px-8 py-10">
      <Helmet>
        <title>Shop All Fragrances — ItraFume</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="font-display text-3xl mb-2">{search ? `Results for "${search}"` : 'Shop All Fragrances'}</h1>
        <p className="text-on-surface-variant text-sm">Explore our full collection of artisanal attars, oud, and perfume oils.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className={`lg:w-64 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-surface-container-low rounded-md p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setFiltersOpen(false)}><FiX /></button>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`block text-sm ${!category ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => updateParam('category', c)}
                    className={`block text-sm ${category === c ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide">Gender</h4>
              <div className="space-y-2">
                {['', 'unisex', 'men', 'women'].map((g) => (
                  <button
                    key={g || 'all'}
                    onClick={() => updateParam('gender', g)}
                    className={`block text-sm capitalize ${gender === g ? 'text-primary font-semibold' : 'text-on-surface-variant'}`}
                  >
                    {g || 'All'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3 uppercase tracking-wide">Other</h4>
              <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={bestseller === 'true'}
                  onChange={(e) => updateParam('bestseller', e.target.checked ? 'true' : '')}
                />
                Bestsellers Only
              </label>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={() => setSearchParams({})}
                className="mt-6 text-xs text-error underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm font-semibold border border-outline-variant px-3 py-2 rounded-sm"
            >
              <FiFilter /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="ml-auto text-sm border border-outline-variant rounded-sm px-3 py-2 bg-surface-container-lowest"
            >
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <p className="text-on-surface-variant py-20 text-center">No products match your filters. Try adjusting your search.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const next = new URLSearchParams(searchParams);
                        next.set('page', p);
                        setSearchParams(next);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-9 h-9 rounded-sm text-sm ${
                        p === page ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
