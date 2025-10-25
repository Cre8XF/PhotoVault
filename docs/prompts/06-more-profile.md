# FILE: 06-more-profile.md

# MorePage - Profile & AI Features

## INSTRUCTIONS

Implement directly. Test. Commit: "feat(more): enhanced profile and AI features section"

## IMPLEMENTATION

### 1. Animated Profile Header

```jsx







          {user?.displayName?.[0]?.toUpperCase() || 'U'}

        {(pinEnabled || biometricEnabled) && (



        )}




          {user?.displayName || user?.email?.split('@')[0]}
          {isPro && (


              Pro

          )}

        {user?.email}



    {!isPro && (


        Oppgrader

    )}


  {/* Quick Stats */}

    {[
      { label: 'Album', value: stats.totalAlbums, icon: FolderOpen },
      { label: 'Bilder', value: stats.totalPhotos, icon: ImagePlus },
      { label: 'Favoritter', value: stats.favorites, icon: Heart },
      { label: 'AI', value: stats.aiAnalyzed, icon: Sparkles },
      { label: 'Nye (7d)', value: stats.recentUploads, icon: Clock }
    ].map((stat, i) => (



          {stat.label}



    ))}


```

### 2. Interactive Storage Widget

```jsx






      Lagring


    {storagePercent > 80 && (


        Nesten fullt

    )}






          {formatBytes(storageUsed)}

        av {formatBytes(storageLimit)}


         90 ? 'text-red-400' :
          storagePercent > 70 ? 'text-orange-400' :
          'text-purple-400'
        }`}>
          %

        Brukt



    {/* Animated Progress Bar */}

       90 ? 'bg-gradient-to-r from-red-500 to-red-600' :
          storagePercent > 70 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
          'bg-gradient-to-r from-purple-500 to-pink-500'
        }`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(storagePercent, 100)}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >




    {/* Upgrade CTA */}
    {!isPro && storagePercent > 70 && (




            Trenger mer plass?

              Oppgrader til Pro og få 100GB lagring + AI-funksjoner



              Oppgrader til Pro




    )}


```

### 3. AI Features Showcase

```jsx

  <button
    onClick={() => setExpandedSection(expandedSection === 'ai' ? null : 'ai')}
    className="w-full p-6 hover:bg-white/5 transition flex items-center justify-between"
  >





        AI-funksjoner
        Smart bildebehandling


    <motion.div
      animate={{ rotate: expandedSection === 'ai' ? 90 : 0 }}
      transition={{ duration: 0.3 }}
    >





    {expandedSection === 'ai' && (


          {[
            { id: 'sort', icon: Scan, title: 'Auto-sortering', desc: 'AI sorterer bilder automatisk', color: 'from-purple-600 to-purple-800', action: handleAutoSort },
            { id: 'enhance', icon: ImagePlus, title: 'Bildeforbedring', desc: 'Forbedre kvalitet med AI', color: 'from-blue-600 to-blue-800', action: handleImageEnhancement },
            { id: 'faces', icon: Users, title: 'Ansiktsgjenkjenning', desc: 'Finn personer i bildene', color: 'from-pink-600 to-pink-800', action: handleFaceRecognition },
            { id: 'tags', icon: Sparkles, title: 'Smart tagging', desc: 'Automatisk bildetagging', color: 'from-green-600 to-green-800', action: handleSmartTagging },
            { id: 'duplicates', icon: Copy, title: 'Duplikat-deteksjon', desc: 'Finn like bilder', color: 'from-yellow-600 to-yellow-800', action: handleDuplicateDetection }
          ].map((feature, i) => (





                {feature.title}
                {feature.desc}



          ))}


    )}


```

## TESTING

- [ ] Profile animations smooth
- [ ] Storage bar animates correctly
- [ ] AI features expandable
- [ ] All buttons functional
- [ ] Mobile responsive

---
