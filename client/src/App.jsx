import { useState, useEffect } from 'react';
import React, { lazy, Suspense } from 'react';

import {
  FaCalendarAlt,
  // FaWifi, 
  // FaWifiOff, 
  FaSync,
  FaDownload,
  FaBullhorn,
  FaRunning,
  FaCog,
  FaPlus
} from 'react-icons/fa';
import {MdWifiOff} from 'react-icons/md'
import { cacheManager } from './utils/cacheManager';
import { useServiceWorker } from './hooks/useServiceWorker';
// const { format, addDays } = lazy(() => import('date-fns'));
import { format, addDays } from 'date-fns';

function App() {
  const [activeTab, setActiveTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState(new Date());

  const { isOnline, updateAvailable, updateApp } = useServiceWorker();

  // Initialize cache on mount
  useEffect(() => {
    cacheManager.init();
    cacheManager.clearExpiredCache();

    // Load initial data
    loadEvents();
    loadActivities();

    // Set up periodic cache cleanup (every hour)
    const cleanupInterval = setInterval(() => {
      cacheManager.clearExpiredCache();
    }, 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Load events with cache-first strategy
  const loadEvents = async () => {
    setLoading(true);

    // Try to get from cache first
    const cachedEvents = await cacheManager.getCachedData('events');

    if (cachedEvents && !isOnline) {
      setEvents(cachedEvents);
      setLoading(false);
      return;
    }

    if (isOnline) {
      try {
        // Simulate API call - replace with your actual API
        const response = await fetch('/mock-api/events.json');
        const data = await response.json();

        setEvents(data);
        // Cache the data
        await cacheManager.cacheData('events', data);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to cache if available
        if (cachedEvents) {
          setEvents(cachedEvents);
        }
      }
    }

    setLoading(false);
  };

  // Load activities with cache-first strategy
  const loadActivities = async () => {
    // Try to get from cache first
    const cachedActivities = await cacheManager.getCachedData('activities');

    if (cachedActivities && !isOnline) {
      setActivities(cachedActivities);
      return;
    }

    if (isOnline) {
      try {
        // Simulate API call - replace with your actual API
        const response = await fetch('/mock-api/activities.json');
        const data = await response.json();

        setActivities(data);
        // Cache the data
        await cacheManager.cacheData('activities', data);
      } catch (error) {
        console.error('Error fetching activities:', error);
        // Fallback to cache if available
        if (cachedActivities) {
          setActivities(cachedActivities);
        }
      }
    }
  };

  // Handle refresh button
  const handleRefresh = async () => {
    if (isOnline) {
      // Clear cache and reload fresh data
      await cacheManager.clearAllCache();
      loadEvents();
      loadActivities();
    }
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    for (let day = startDate; day <= endDate; day = addDays(day, 1)) {
      days.push(day);
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Status Bar */}
      <div className="bg-indigo-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-xl" />
            <h1 className="text-xl font-bold">Post Automation</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-300' : 'text-yellow-300'}`}>
              {/* {isOnline ? <FaWifi /> : <MdWifiOff/>} */}
              <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button 
              onClick={handleRefresh}
              disabled={!isOnline}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 transition"
              title="Refresh data"
            >
              <FaSync  className={`text-black  transition-all  ${loading ?  "  rotate-90" : " rotate-0"}`} 
              />
            </button>
          </div>
        </div>
      </div>

      {/* Update Available Banner */}
      {updateAvailable && (
        <div className="bg-yellow-500 text-white p-3 text-center">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <span>New version available!</span>
            <button
              onClick={updateApp}
              className="ml-4 px-4 py-1 bg-white text-yellow-600 rounded font-medium hover:bg-gray-100 transition"
            >
              Update Now
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto">
        <div className="flex border-b">
          {['events', 'activities', 'calendar', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:block flex flex-col justify-center items-center py-4 font-medium capitalize transition-all  ${activeTab === tab
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab === 'events' && <FaBullhorn className="inline mr-2" />}
              {tab === 'activities' && <FaRunning className="inline mr-2" />}
              {tab === 'calendar' && <FaCalendarAlt className="inline mr-2" />}
              {tab === 'settings' && <FaCog className="inline mr-2" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="p-4 md:p-6">
          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
                <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  <FaPlus />
                  <span>Add Event</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading events...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.length > 0 ? (
                    events.map((event) => (
                      <div key={event.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                        <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-indigo-600 font-medium">
                            {format(new Date(event.date), 'MMM dd, yyyy')}
                          </span>
                          <button className="text-sm text-gray-500 hover:text-indigo-600 transition">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-gray-500">No events found. {!isOnline && 'You are offline.'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ongoing Activities</h2>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                    <h3 className="font-bold text-lg mb-2">{activity.title}</h3>
                    <p className="text-gray-600 mb-4">{activity.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-indigo-600 font-medium">
                        {/* {format(new Date(activity.date), 'MMM dd, yyyy')}  */} date :
                      </span>
                      <button className="text-sm text-gray-500 hover:text-indigo-600 transition">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-500">No events found. {!isOnline && 'You are offline.'}</p>
                </div>
              )}


              {/* Add activities content */}

            </div>
          )}

          {/* Calendar Tab */}
          {activeTab === 'calendar' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Calendar</h2>
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`text-center py-3 rounded-lg ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'hover:bg-gray-100'
                        }`}
                    >
                      {format(day, 'd')}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>

              <img src="data:image/jpeg;base64,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" alt="" />

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg mb-4">Cache Management</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 mb-2">Current Status: {isOnline ? 'Online' : 'Offline'}</p>
                        <p className="text-sm text-gray-500">
                          {isOnline
                            ? 'Data will be refreshed when online. Offline data is served from cache.'
                            : 'You are offline. Using cached data.'
                          }
                        </p>
                      </div>

                      <button
                        onClick={() => alert('Funtionality is disabled currently. thank you!')}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium"
                      >
                        Clear All Cache
                      </button>

                      <button
                        onClick={() => alert('Funtionality is disabled currently. thank you!')}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition font-medium"
                      >
                        Unregister Service Worker
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-lg mb-4">Install App</h3>
                    <p className="text-gray-600 mb-4">
                      Install this app on your device for offline access and better experience.
                    </p>
                    <button
                      onClick={async () => {
                        if ('BeforeInstallPromptEvent' in window) {
                          const deferredPrompt = window.deferredPrompt;
                          if (deferredPrompt) {
                            deferredPrompt.prompt();
                            const { outcome } = await deferredPrompt.userChoice;
                            console.log(`User response to the install prompt: ${outcome}`);
                            window.deferredPrompt = null;
                          }
                        }
                      }}
                      className="flex items-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                    >
                      <FaDownload />
                      <span>Install App</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;