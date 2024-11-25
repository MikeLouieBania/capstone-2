import { auth } from "@clerk/nextjs/server"; // Clerk's server-side authentication
import { Roles } from "@/types/global"; // Import the Roles type for validation

// Function to check the role from Clerk's metadata
export const checkRole = async (role: Roles) => {
  try {
    const { sessionClaims } = await auth(); // Fetch the session claims (metadata) from Clerk

    // Ensure sessionClaims and metadata are defined
    if (!sessionClaims || !sessionClaims.metadata) {
      console.error("No session claims or metadata found");
      return false;
    }

    const userRole = sessionClaims.metadata.role;
    console.log("User role from metadata:", userRole); // Log the role from Clerk's metadata

    return userRole === role; // Check if the role matches the given role
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
};
