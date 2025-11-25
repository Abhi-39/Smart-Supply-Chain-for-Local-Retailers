package com.abhi.retailchain;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173") // React dev server
public class ProductController {

    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ProductController(ProductRepository productRepository, SimpMessagingTemplate messagingTemplate) {
        this.productRepository = productRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // ----------------------------------------------------------
    // GET ALL PRODUCTS
    // ----------------------------------------------------------
    @GetMapping
    public ResponseEntity<List<Product>> getProducts() {
        // seed initial test data (only when DB is empty)
        if (productRepository.count() == 0) {
            productRepository.save(new Product("Milk 1L", "MILK-001", "Dairy"));
            productRepository.save(new Product("Bread", "BREAD-001", "Bakery"));
            productRepository.save(new Product("Eggs 12pcs", "EGG-012", "Poultry"));
        }

        return ResponseEntity.ok(productRepository.findAll());
    }

    // ----------------------------------------------------------
    // CREATE PRODUCT (POST)
    // ----------------------------------------------------------
    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        product.setId(null); // ensure ID is generated
        Product saved = productRepository.save(product);

        // Broadcast CREATE event to WebSocket subscribers
        messagingTemplate.convertAndSend("/topic/products", new WsProductEvent("CREATE", saved));

        return ResponseEntity
                .created(URI.create("/api/products/" + saved.getId()))
                .body(saved);
    }

    // ----------------------------------------------------------
    // DELETE PRODUCT (DELETE)
    // ----------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {

        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id " + id);
        }

        Product deleted = productRepository.findById(id).get();
        productRepository.deleteById(id);

        // Broadcast DELETE event
        messagingTemplate.convertAndSend("/topic/products", new WsProductEvent("DELETE", deleted));

        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------
    // UPDATE PRODUCT (PUT)
    // ----------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody Product updatedProduct) {

        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id " + id));

        existing.setName(updatedProduct.getName());
        existing.setSku(updatedProduct.getSku());
        existing.setCategory(updatedProduct.getCategory());

        Product saved = productRepository.save(existing);

        // Broadcast UPDATE event
        messagingTemplate.convertAndSend("/topic/products", new WsProductEvent("UPDATE", saved));

        return ResponseEntity.ok(saved);
    }
}
