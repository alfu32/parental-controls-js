cmake_minimum_required(VERSION 3.0)

project(main-gtk)

find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK3 REQUIRED gtk+-3.0)

include_directories(${GTK3_INCLUDE_DIRS})
link_directories(${GTK3_LIBRARY_DIRS})
add_definitions(${GTK3_CFLAGS_OTHER})

add_executable(main-gtk main-gtk.c)
target_link_libraries(main-gtk ${GTK3_LIBRARIES})
