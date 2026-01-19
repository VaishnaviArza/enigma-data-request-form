import React, { useState, useEffect, useRef } from "react";
import { Form, ListGroup } from "react-bootstrap";

interface SearchResult {
  index: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

interface SearchBarProps {
  collaborators: any[];
  onSelectCollaborator: (index: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ collaborators, onSelectCollaborator }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const query = searchQuery.toLowerCase();
    console.log("Search query:", query); // ✅ DEBUG
    
    // Filter collaborators by email, first name, or last name
    const results = collaborators
      .filter((collab) => {
        const primaryEmail = (collab.primary_email || "").toLowerCase();
        const email = (collab.email || "").toLowerCase();
        const emailList = collab.email_list || [];
        const allEmails = [primaryEmail, email, ...emailList].map(e => 
            typeof e === 'string' ? e.toLowerCase() : ''
        );
        const firstName = (collab.first_name || "").toLowerCase();
        const lastName = (collab.last_name || "").toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        // ✅ DEBUG - log what we're checking
      console.log("Checking:", { email, firstName, lastName, query });
        return (
          allEmails.some(e => e.includes(query)) ||
          firstName.includes(query) ||
          lastName.includes(query) ||
          fullName.includes(query)
        );
      })
      .slice(0, 7) // Top 7 results
      .map((collab) => ({
        index: collab.index,
        email: collab.primary_email || collab.email || collab.email_list?.[0] || "",
        first_name: collab.first_name || "",
        last_name: collab.last_name || "",
        role: collab.role || "Member",
      }));
    console.log("Total results:", results.length); // ✅ DEBUG
    setSearchResults(results);
    setShowDropdown(results.length > 0);
  }, [searchQuery, collaborators]);

  const handleSelectCollaborator = (index: string) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    onSelectCollaborator(index);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    
    return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            style={{
              backgroundColor: "#fff3cd",
              padding: "0",
              fontWeight: "inherit",
              color: "inherit",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
  };

  return (
    <div ref={searchRef} style={{ position: "relative", marginBottom: "20px" }}>
      <div style={{ position: "relative" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          fill="currentColor"
          className="bi bi-search"
          viewBox="0 0 16 16"
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6c757d",
          }}
        >
          <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
        </svg>
        <Form.Control
          type="text"
          placeholder="Search for a collaborator"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          style={{
            paddingLeft: "40px",
            borderRadius: "8px",
            border: "1px solid #dee2e6",
          }}
        />
      </div>

      {showDropdown && searchResults.length > 0 && (
        <ListGroup
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: "4px",
            maxHeight: "400px",
            overflowY: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          {searchResults.map((result) => (
            <ListGroup.Item
              key={result.index}
              action
              onClick={() => handleSelectCollaborator(result.index)}
              style={{
                cursor: "pointer",
                padding: "12px 16px",
                borderLeft: "3px solid transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftColor = "#0d6efd";
                e.currentTarget.style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftColor = "transparent";
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <div>
                <div style={{ fontSize: "14px", fontWeight: 500, color: "#212529" }}>
                  {highlightMatch(result.email, searchQuery)}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6c757d",
                    marginTop: "4px",
                  }}
                >
                    {highlightMatch(
                      `${result.first_name} ${result.last_name}`,
                      searchQuery
                    )}
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default SearchBar;