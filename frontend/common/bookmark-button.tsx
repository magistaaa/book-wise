'use client'
import Link from "next/link";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

const BookmarkButton = ({ bookId, bookTitle, customClass }: { bookId: number; bookTitle: string, customClass?: string }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        // Check localStorage only on the client
        if (typeof window !== "undefined") {
        const storedBookmarks = JSON.parse(localStorage.getItem("bookmarkedBooks") || "[]");
        setIsBookmarked(storedBookmarks.includes(bookId));
        }
    }, [bookId]);
  
    const handleBookmark = () => {
      setIsBookmarked(!isBookmarked);
  
      // Retrieve current bookmarks from localStorage
      const storedBookmarks = JSON.parse(localStorage.getItem("bookmarkedBooks") || "[]");
  
      if (!isBookmarked) {
        // Add the book ID to localStorage
        const updatedBookmarks = [...storedBookmarks, bookId];
        localStorage.setItem("bookmarkedBooks", JSON.stringify(updatedBookmarks));
  
        toast.success(
          <div className="flex items-center">
            <Bookmark className="w-8 h-8 mr-2" fill="currentColor" />
            <span>
              {bookTitle} has been{" "}
              <Link href="/settings/bookmark" className="underline">
                bookmarked!
              </Link>
            </span>
          </div>
        );
      } else {
        // Remove the book ID from localStorage
        const updatedBookmarks = storedBookmarks.filter((id: number) => id !== bookId);
        localStorage.setItem("bookmarkedBooks", JSON.stringify(updatedBookmarks));
  
        toast.success(
          <div className="flex items-center">
            <Bookmark className="w-8 h-8 mr-2" />
            <span>
              {bookTitle} has been{" "}
              <Link href="/settings/bookmark" className="underline">
                unbookmarked!
              </Link>
            </span>
          </div>
        );
      }
    };
  
    return (
      <Button
        className="bg-white border shadow p-2 hover:bg-gray-100 transition flex items-center"
        onClick={handleBookmark}
      >
        <Bookmark
          className="w-6 h-6 text-gray-500"
          fill={isBookmarked ? "currentColor" : "none"}
        />
      </Button>
    );
  };

  export default BookmarkButton;