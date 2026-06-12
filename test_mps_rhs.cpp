#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>

int main() {
    std::ifstream file("/Users/shijinxin/PycharmProjects/or_solver/python_HiGHs/aps_example/aps_example.mps");
    if (!file.is_open()) {
        std::cerr << "Failed to open file" << std::endl;
        return 1;
    }
    
    std::string line;
    bool inRHS = false;
    while (std::getline(file, line)) {
        // 查找RHS段
        if (line.find("RHS") != std::string::npos && line.find("RHS") == 0) {
            inRHS = true;
            std::cout << "Found RHS section start: " << line << std::endl;
            continue;
        }
        
        // 查找其他段开始
        if (line.find("BOUNDS") == 0 || line.find("ENDATA") == 0) {
            if (inRHS) {
                std::cout << "RHS section ends" << std::endl;
                inRHS = false;
            }
        }
        
        // 打印RHS段的每一行
        if (inRHS) {
            std::cout << "RHS line: [" << line << "]" << std::endl;
            
            // 解析并显示parts
            std::istringstream iss(line);
            std::vector<std::string> parts;
            std::string part;
            while (iss >> part) {
                parts.push_back(part);
            }
            
            std::cout << "  Parts: ";
            for (size_t i = 0; i < parts.size(); i++) {
                std::cout << "[" << i << "]=" << parts[i];
                if (i < parts.size() - 1) std::cout << ", ";
            }
            std::cout << std::endl;
        }
    }
    
    return 0;
}
