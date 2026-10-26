#pragma once

#include <cstdint>
#include <string>

namespace library::genre_override {
inline constexpr size_t MAX_BYTES = 95;
inline constexpr char DIRECTORY[] = "/.crosspoint/library-genres";
enum class Result : uint8_t { Missing, Assigned, Metadata, Error };
bool available();
// A bounded record per edited book, outside disposable EPUB caches. No catalog
// or per-book metadata is retained in RAM. Identity matches the Library path.
Result read(uint64_t pathHash, std::string& genre);
bool save(uint64_t pathHash, const std::string& genre, bool useMetadata = false);
}  // namespace library::genre_override
