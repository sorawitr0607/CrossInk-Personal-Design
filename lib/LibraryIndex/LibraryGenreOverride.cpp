#include "LibraryGenreOverride.h"

#include <HalStorage.h>
#include <Logging.h>

#include <array>
#include <cctype>
#include <cstdio>
#include <cstring>

namespace library::genre_override {
namespace {
// LG01, little-endian path hash, length, mode, reserved, 96 label bytes, FNV32.
using Record = std::array<uint8_t, 116>;
constexpr size_t TEXT = 16, CHECK = 112;
uint32_t checksum(const Record& record) {
  uint32_t hash = 2166136261u;
  for (size_t i = 0; i < CHECK; ++i) hash = (hash ^ record[i]) * 16777619u;
  return hash;
}
void pathFor(const uint64_t hash, char (&path)[80]) {
  snprintf(path, sizeof(path), "%s/%016llx.lgr", DIRECTORY, static_cast<unsigned long long>(hash));
}
bool validLabel(const std::string& label) {
  if (label.empty() || label.size() > MAX_BYTES || std::isspace(static_cast<unsigned char>(label.front())) ||
      std::isspace(static_cast<unsigned char>(label.back())))
    return false;
  for (const unsigned char byte : label)
    if (byte < 32 || byte == 127) return false;
  return true;
}
}  // namespace

bool available() { return Storage.exists(DIRECTORY); }

Result read(const uint64_t pathHash, std::string& genre) {
  genre.clear();
  char path[80];
  pathFor(pathHash, path);
  if (!Storage.exists(path)) {
    const auto length = strlen(path);
    if (length + 5 > sizeof(path)) return Result::Error;
    memcpy(path + length, ".bak", 5);
    if (!Storage.exists(path)) return Result::Missing;
  }
  Record record{};
  FsFile file;
  if (!Storage.openFileForRead("LIBGENRE", path, file)) return Result::Error;
  const bool ok = file.fileSize() == record.size() && file.read(record.data(), record.size()) == record.size();
  file.close();
  uint64_t storedHash = 0;
  uint32_t storedCheck = 0;
  memcpy(&storedHash, record.data() + 4, sizeof(storedHash));
  memcpy(&storedCheck, record.data() + CHECK, sizeof(storedCheck));
  if (!ok || memcmp(record.data(), "LG01", 4) || storedHash != pathHash || record[12] > MAX_BYTES || record[13] > 1 ||
      checksum(record) != storedCheck) {
    LOG_ERR("LIBGENRE", "Invalid genre override: %s", path);
    return Result::Error;
  }
  if (record[13] == 0) return Result::Metadata;
  genre.assign(reinterpret_cast<const char*>(record.data() + TEXT), record[12]);
  return validLabel(genre) ? Result::Assigned : Result::Error;
}

bool save(const uint64_t pathHash, const std::string& genre, const bool useMetadata) {
  if (!useMetadata && !validLabel(genre)) return false;
  if ((!Storage.exists("/.crosspoint") && !Storage.mkdir("/.crosspoint")) ||
      (!available() && !Storage.mkdir(DIRECTORY)))
    return false;
  Record record{};
  memcpy(record.data(), "LG01", 4);
  memcpy(record.data() + 4, &pathHash, sizeof(pathHash));
  if (!useMetadata) {
    record[12] = static_cast<uint8_t>(genre.size());
    record[13] = 1;
    memcpy(record.data() + TEXT, genre.data(), genre.size());
  }
  const uint32_t check = checksum(record);
  memcpy(record.data() + CHECK, &check, sizeof(check));
  char path[80];
  pathFor(pathHash, path);
  // Two short strings exist only during an explicit edit. Ordinary lookup uses
  // an 80-byte path and 116-byte record on the stack, without allocations.
  const std::string temporary = std::string(path) + ".tmp";
  const std::string backup = std::string(path) + ".bak";
  if (!Storage.exists(path) && Storage.exists(backup.c_str()) && !Storage.rename(backup.c_str(), path)) return false;
  FsFile file;
  if (!Storage.openFileForWrite("LIBGENRE", temporary, file)) return false;
  const bool written = file.write(record.data(), record.size()) == record.size() && file.sync();
  const bool closed = file.close();
  if (!written || !closed) {
    Storage.remove(temporary.c_str());
    return false;
  }
  const bool previous = Storage.exists(path);
  if (previous &&
      ((Storage.exists(backup.c_str()) && !Storage.remove(backup.c_str())) || !Storage.rename(path, backup.c_str()))) {
    Storage.remove(temporary.c_str());
    return false;
  }
  if (!Storage.rename(temporary.c_str(), path)) {
    if (previous && !Storage.rename(backup.c_str(), path)) LOG_ERR("LIBGENRE", "Cannot restore genre backup");
    Storage.remove(temporary.c_str());
    return false;
  }
  if (previous && !Storage.remove(backup.c_str())) LOG_ERR("LIBGENRE", "Cannot remove completed genre backup");
  return true;
}
}  // namespace library::genre_override
