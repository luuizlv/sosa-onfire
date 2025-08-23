import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupSupabaseAuth, isAuthenticated, supabase, supabaseAdmin } from "./supabaseAuth";
import { storage, createBrazilDate } from "./storage";


export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupSupabaseAuth(app);

  // Get all bets for a user with filters
  app.get("/api/bets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { betType, house, startDate, endDate, period, month, year } = req.query;
      
      const filters = {
        betType: betType || undefined,
        house: house || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        period: period || undefined,
        month: month || undefined,
        year: year || undefined,
      };

      const bets = await storage.getBets(userId, filters);
      res.json(bets);
    } catch (error) {
      console.error("Error fetching bets:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get available months from user bets
  app.get("/api/bets/months", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bets = await storage.getBets(userId);
      const months = new Set<string>();
      
      bets.forEach(bet => {
        const date = new Date(bet.placedAt);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.add(month);
      });
      
      const sortedMonths = Array.from(months).sort().reverse();
      res.json(sortedMonths);
    } catch (error) {
      console.error("Error fetching available months:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get available years from user bets
  app.get("/api/bets/years", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bets = await storage.getBets(userId);
      const years = new Set<string>();
      
      bets.forEach(bet => {
        const date = new Date(bet.placedAt);
        const year = date.getFullYear().toString();
        years.add(year);
      });
      
      const sortedYears = Array.from(years).sort().reverse();
      res.json(sortedYears);
    } catch (error) {
      console.error("Error fetching available years:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get bet statistics for previous period
  app.get("/api/bets/stats/previous", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { period = 'daily' } = req.query;
      
      // Calculate previous period dates
      const now = new Date();
      let startDate: string;
      let endDate: string;
      
      if (period === 'daily') {
        // Previous day
        const prevDay = new Date(now);
        prevDay.setDate(prevDay.getDate() - 1);
        startDate = prevDay.toISOString().split('T')[0];
        endDate = prevDay.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        // Previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate = prevMonth.toISOString().split('T')[0];
        const endMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate = endMonth.toISOString().split('T')[0];
      } else {
        // Previous year
        const prevYear = now.getFullYear() - 1;
        startDate = `${prevYear}-01-01`;
        endDate = `${prevYear}-12-31`;
      }
      
      const stats = await storage.getBetStats(userId, { 
        period: period as any, 
        startDate, 
        endDate 
      });
      
      res.json(stats);
    } catch (error) {
      console.error("Error getting previous period stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get bet statistics
  app.get("/api/bets/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { period = 'daily', month, year } = req.query;
      
      const stats = await storage.getBetStats(userId, { period: period as any, month, year });
      res.json(stats);
    } catch (error) {
      console.error("Error fetching bet stats:", error);
      res.status(500).json({ message: "Failed to fetch bet stats" });
    }
  });

  // Create a new bet
  app.post("/api/bets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { stake, payout, betType, house, description, placedAt, status } = req.body;

      const betData = {
        userId: userId,
        stake: stake,
        payout: payout,
        betType: betType,
        status: status || 'pending' as const, // Use provided status or default to pending
        house: house || null,
        description: description || null,
        placedAt: placedAt,
      };

      const newBet = await storage.createBet(betData);
      console.log("Created bet:", newBet);
      res.json(newBet);
    } catch (error) {
      console.error("Error creating bet:", error);
      res.status(500).json({ message: "Failed to create bet" });
    }
  });

  // Update bet status
  app.patch("/api/bets/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const betId = req.params.id;
      const { status } = req.body;
      
      if (!['pending', 'completed', 'lost'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedBet = await storage.updateBet({ id: betId, status });
      console.log("Updated bet status:", updatedBet);
      res.json(updatedBet);
    } catch (error) {
      console.error("Error updating bet status:", error);
      res.status(500).json({ message: "Failed to update bet status" });
    }
  });

  // Delete a bet
  app.delete("/api/bets/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const betId = req.params.id;
      
      await storage.deleteBet(betId, userId);
      console.log("Deleted bet:", betId);
      res.json({ message: "Bet deleted successfully" });
    } catch (error) {
      console.error("Error deleting bet:", error);
      res.status(500).json({ message: "Failed to delete bet" });
    }
  });

  // Upload user profile photo to Supabase Storage
  app.post("/api/profile/photo/upload", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { fileBase64, fileName } = req.body;
      
      if (!fileBase64 || !fileName) {
        return res.status(400).json({ message: "File data and name are required" });
      }

      // Remove data URL prefix (data:image/jpeg;base64,)
      const base64Data = fileBase64.replace(/^data:image\/[a-z]+;base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');

      // Check if bucket exists, create if not using admin client
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'profile-images');
      
      if (!bucketExists) {
        console.log('Creating profile-images bucket...');
        const { error: bucketError } = await supabaseAdmin.storage.createBucket('profile-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
          fileSizeLimit: 1048576 // 1MB
        });
        if (bucketError) {
          console.error("Error creating bucket:", bucketError);
          // Continue anyway - bucket might exist but not be listed
        } else {
          console.log('Bucket created successfully');
        }
      }

      // Upload to Supabase Storage using admin client
      const filePath = `${userId}/${Date.now()}-${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('profile-images')
        .upload(filePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return res.status(500).json({ message: "Failed to upload image to storage" });
      }

      // Get public URL using admin client
      const { data: urlData } = supabaseAdmin.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update user profile in database
      const updatedUser = await storage.updateUserProfileImage(userId, publicUrl);
      console.log("Updated user profile photo with Supabase URL:", updatedUser.id);
      
      res.json({ 
        user: updatedUser,
        imageUrl: publicUrl 
      });
    } catch (error) {
      console.error("Error uploading profile photo:", error);
      res.status(500).json({ message: "Failed to upload profile photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}