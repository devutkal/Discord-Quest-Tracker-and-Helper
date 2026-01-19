/**
 * Discord Quest Tracker & Helper
 * A SAFE and LEGITIMATE tool to track your Discord quests
 * 
 * Features:
 * - View all active quests
 * - Track quest progress
 * - Get reminders and notifications
 * - See quest requirements and deadlines
 * - Calculate time remaining
 * 
 * Usage: Paste this code into Discord's Developer Console (F12)
 * This script is SAFE - it only reads data, never automates anything
 */

(function() {
    'use strict';
    
    // Clean up
    delete window.$;
    
    // Initialize Discord's internal modules (read-only)
    const wpRequire = webpackChunkdiscord_app.push([[Symbol()], {}, r => r]);
    webpackChunkdiscord_app.pop();
    
    // Get Discord stores (read-only access)
    const QuestsStore = Object.values(wpRequire.c).find(x => x?.exports?.Z?.__proto__?.getQuest)?.exports.Z;
    
    if (!QuestsStore) {
        console.error("❌ Could not access Quest data. Try refreshing Discord.");
        return;
    }
    
    // Styling for console output
    const styles = {
        title: 'color: #5865F2; font-size: 16px; font-weight: bold;',
        header: 'color: #57F287; font-weight: bold;',
        info: 'color: #3BA55D;',
        warning: 'color: #FAA61A;',
        error: 'color: #ED4245;',
        quest: 'color: #5865F2; font-weight: bold;',
        progress: 'color: #57F287;',
        time: 'color: #FEE75C;'
    };
    
    // Helper functions
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m ${secs}s`;
        return `${secs}s`;
    };
    
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getTimeRemaining = (expiresAt) => {
        const now = Date.now();
        const expiry = new Date(expiresAt).getTime();
        const diff = expiry - now;
        
        if (diff <= 0) return "Expired";
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        return `${hours}h`;
    };
    
    const getProgressBar = (current, total, length = 20) => {
        const percentage = Math.min((current / total) * 100, 100);
        const filled = Math.floor((percentage / 100) * length);
        const empty = length - filled;
        
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `${bar} ${percentage.toFixed(1)}%`;
    };
    
    const getTaskTypeIcon = (taskType) => {
        const icons = {
            'WATCH_VIDEO': '📺',
            'WATCH_VIDEO_ON_MOBILE': '📱',
            'PLAY_ON_DESKTOP': '🎮',
            'STREAM_ON_DESKTOP': '📡',
            'PLAY_ACTIVITY': '🎯'
        };
        return icons[taskType] || '📋';
    };
    
    const getTaskTypeName = (taskType) => {
        const names = {
            'WATCH_VIDEO': 'Watch Video',
            'WATCH_VIDEO_ON_MOBILE': 'Watch on Mobile',
            'PLAY_ON_DESKTOP': 'Play Game',
            'STREAM_ON_DESKTOP': 'Stream Game',
            'PLAY_ACTIVITY': 'Play Activity'
        };
        return names[taskType] || taskType;
    };
    
    // Get all quests
    const allQuests = [...QuestsStore.quests.values()];
    
    // Categorize quests
    const activeQuests = allQuests.filter(q => 
        q.userStatus?.enrolledAt && 
        !q.userStatus?.completedAt && 
        new Date(q.config.expiresAt).getTime() > Date.now()
    );
    
    const completedQuests = allQuests.filter(q => q.userStatus?.completedAt);
    const expiredQuests = allQuests.filter(q => 
        q.userStatus?.enrolledAt &&
        !q.userStatus?.completedAt &&
        new Date(q.config.expiresAt).getTime() <= Date.now()
    );
    const availableQuests = allQuests.filter(q => !q.userStatus?.enrolledAt);
    
    // Display header
    console.clear();
    console.log('%c╔══════════════════════════════════════════════════════╗', styles.title);
    console.log('%c║       🎮 DISCORD QUEST TRACKER & HELPER 🎮          ║', styles.title);
    console.log('%c╚══════════════════════════════════════════════════════╝', styles.title);
    console.log('');
    
    // Summary
    console.log('%c📊 QUEST SUMMARY', styles.header);
    console.log(`%c   Active Quests: ${activeQuests.length}`, styles.info);
    console.log(`%c   Completed: ${completedQuests.length}`, styles.progress);
    console.log(`%c   Available: ${availableQuests.length}`, styles.warning);
    console.log(`%c   Expired: ${expiredQuests.length}`, styles.error);
    console.log('');
    
    // Display active quests
    if (activeQuests.length > 0) {
        console.log('%c🎯 ACTIVE QUESTS (In Progress)', styles.header);
        console.log('%c─────────────────────────────────────────────────────', styles.info);
        console.log('');
        
        activeQuests.forEach((quest, index) => {
            const config = quest.config.taskConfig ?? quest.config.taskConfigV2;
            const taskTypes = Object.keys(config.tasks);
            const taskType = taskTypes[0];
            const task = config.tasks[taskType];
            
            const progress = quest.userStatus?.progress?.[taskType]?.value || 0;
            const target = task.target;
            const percentage = ((progress / target) * 100).toFixed(1);
            
            console.log(`%c${index + 1}. ${getTaskTypeIcon(taskType)} ${quest.config.messages.questName}`, styles.quest);
            console.log(`   📱 App: ${quest.config.application.name}`);
            console.log(`   📋 Task: ${getTaskTypeName(taskType)}`);
            console.log(`   ⏱️  Time needed: ${formatTime(target)}`);
            console.log(`   📈 Progress: ${formatTime(progress)} / ${formatTime(target)} (${percentage}%)`);
            console.log(`   ${getProgressBar(progress, target)}`);
            console.log(`   ⏰ Expires: ${formatDate(quest.config.expiresAt)} (${getTimeRemaining(quest.config.expiresAt)} left)`);
            
            // Calculate estimated completion time
            if (progress < target) {
                const remaining = target - progress;
                console.log(`   ⏳ Time remaining: ${formatTime(remaining)}`);
            } else {
                console.log(`   ✅ Ready to claim reward!`);
            }
            
            console.log('');
        });
    } else {
        console.log('%c   No active quests in progress', styles.warning);
        console.log('');
    }
    
    // Display available quests
    if (availableQuests.length > 0) {
        console.log('%c🆕 AVAILABLE QUESTS (Not Started)', styles.header);
        console.log('%c─────────────────────────────────────────────────────', styles.info);
        console.log('');
        
        availableQuests.forEach((quest, index) => {
            const config = quest.config.taskConfig ?? quest.config.taskConfigV2;
            const taskTypes = Object.keys(config.tasks);
            const taskType = taskTypes[0];
            const task = config.tasks[taskType];
            
            console.log(`%c${index + 1}. ${getTaskTypeIcon(taskType)} ${quest.config.messages.questName}`, styles.quest);
            console.log(`   📱 App: ${quest.config.application.name}`);
            console.log(`   📋 Task: ${getTaskTypeName(taskType)}`);
            console.log(`   ⏱️  Time needed: ${formatTime(task.target)}`);
            console.log(`   ⏰ Expires: ${formatDate(quest.config.expiresAt)} (${getTimeRemaining(quest.config.expiresAt)} left)`);
            console.log(`   🎁 Reward: ${quest.config.rewards?.[0]?.messages?.name || 'Check Discord'}`);
            console.log('');
        });
    }
    
    // Display completed quests
    if (completedQuests.length > 0) {
        console.log('%c✅ COMPLETED QUESTS', styles.header);
        console.log('%c─────────────────────────────────────────────────────', styles.info);
        console.log('');
        
        completedQuests.forEach((quest, index) => {
            console.log(`%c${index + 1}. ✓ ${quest.config.messages.questName}`, styles.progress);
            console.log(`   Completed: ${formatDate(quest.userStatus.completedAt)}`);
            console.log('');
        });
    }
    
    // Tips section
    console.log('%c💡 TIPS FOR QUEST COMPLETION', styles.header);
    console.log('%c─────────────────────────────────────────────────────', styles.info);
    console.log('');
    console.log('%c✓ Watch Video quests can be completed in browser', styles.info);
    console.log('%c✓ Game/Stream quests require Discord Desktop App', styles.info);
    console.log('%c✓ Stream quests need at least 1 person in voice chat', styles.info);
    console.log('%c✓ Activity quests can be done in DMs or servers', styles.info);
    console.log('%c✓ Check back regularly before quests expire!', styles.warning);
    console.log('');
    
    // Footer
    console.log('%c─────────────────────────────────────────────────────', styles.info);
    console.log('%c✨ This tool is SAFE - it only reads your quest data', styles.progress);
    console.log('%c🔄 Run this script again anytime to refresh quest status', styles.info);
    console.log('%c─────────────────────────────────────────────────────', styles.info);
    
    // Store reference for easy re-run
    window.checkQuests = arguments.callee;
    console.log('');
    console.log('%c💾 Tip: Type "checkQuests()" to run this again!', styles.warning);
    
})();