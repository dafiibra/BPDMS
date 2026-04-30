# Backend Setup — Spring Boot

## Tech Stack
- Java 17
- Spring Boot 3.x
- Spring Data JPA + Hibernate
- Oracle JDBC: com.oracle.database.jdbc:ojdbc11
- Lombok
- Maven

## Package Structure
```
com.mandiri.branchperformance
├── BranchPerformanceApplication.java
├── config/
│   └── OracleConfig.java           (datasource + CORS)
├── controller/
│   ├── DanaController.java
│   ├── TabunganController.java
│   ├── GiroController.java
│   ├── DepositorController.java
│   ├── NtbController.java
│   └── OrgController.java
├── service/
│   ├── DanaService.java
│   ├── TabunganService.java
│   ├── GiroService.java
│   ├── DepositorService.java
│   └── NtbService.java
├── repository/
│   ├── DanaRepository.java
│   ├── TabunganRepository.java
│   ├── GiroRepository.java
│   ├── DepositorRepository.java
│   ├── NtbRepository.java
│   └── OrgRepository.java
├── model/
│   ├── entity/
│   │   ├── FactDanaDaily.java
│   │   ├── FactDanaTarget.java
│   │   ├── FactTabunganDaily.java
│   │   ├── FactTabunganTarget.java
│   │   ├── FactGiroDaily.java
│   │   ├── FactGiroTarget.java
│   │   ├── FactDepositoDaily.java
│   │   ├── FactDepositoTarget.java
│   │   ├── FactNtbDaily.java
│   │   ├── FactNtbTarget.java
│   │   ├── OrgRegion.java
│   │   ├── OrgArea.java
│   │   ├── OrgBranch.java
│   │   ├── MstSegment.java
│   │   └── MstPeriod.java
│   └── dto/
│       ├── ApiResponseDto.java
│       ├── DanaSummaryDto.java
│       ├── DanaGrowthDto.java
│       ├── DanaChartDto.java
│       ├── DanaCompositionDto.java
│       ├── DanaDetailDto.java
│       ├── TabunganMetricsDto.java
│       ├── NtbSummaryDto.java
│       ├── GiroAcquisitionDto.java
│       └── DepositoCurrencyDto.java
└── util/
    └── DateUtil.java
```

## application.yml
```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:oracle:thin:@//localhost:1521/BRANCHPERFDB
    username: your_username
    password: your_password
    driver-class-name: oracle.jdbc.OracleDriver
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: none
    properties:
      hibernate:
        dialect: org.hibernate.dialect.OracleDialect
        default_schema: BRANCHPERFDB

logging:
  level:
    com.mandiri: DEBUG
```

## Coding Conventions

### ApiResponseDto — wajib dipakai semua endpoint
```java
@Data
@AllArgsConstructor
public class ApiResponseDto<T> {
    private boolean success;
    private T data;
    private String message;
    private LocalDateTime timestamp;

    public static <T> ApiResponseDto<T> ok(T data) {
        return new ApiResponseDto<>(true, data, "OK", LocalDateTime.now());
    }

    public static <T> ApiResponseDto<T> error(String message) {
        return new ApiResponseDto<>(false, null, message, LocalDateTime.now());
    }
}
```

### Entity — cara handle RAW(16) UUID Oracle
```java
@Data
@Entity
@Table(name = "FACT_DANA_DAILY")
public class FactDanaDaily {
    @Id
    @Column(name = "ID", columnDefinition = "RAW(16)")
    private UUID id;

    @Column(name = "BRANCH_ID", columnDefinition = "RAW(16)")
    private UUID branchId;

    @Column(name = "SEGMENT_ID", columnDefinition = "RAW(16)")
    private UUID segmentId;

    @Column(name = "SNAPSHOT_DATE")
    private LocalDate snapshotDate;

    @Column(name = "AVG_BALANCE")
    private BigDecimal avgBalance;

    @Column(name = "ENDING_BALANCE")
    private BigDecimal endingBalance;

    @Column(name = "COF")
    private BigDecimal cof;

    @Column(name = "GROWTH_MTD")
    private BigDecimal growthMtd;

    @Column(name = "GROWTH_YTD")
    private BigDecimal growthYtd;

    @Column(name = "GROWTH_YOY")
    private BigDecimal growthYoy;
}
```

### Controller — struktur standar
```java
@RestController
@RequestMapping("/api/v1/dana")
@RequiredArgsConstructor
@Slf4j
public class DanaController {
    private final DanaService danaService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponseDto<DanaSummaryDto>> getSummary(
        @RequestParam String level,
        @RequestParam String levelId,
        @RequestParam(required = false) String snapshotDate,
        @RequestParam(required = false) String periodCode,
        @RequestParam(required = false, defaultValue = "ALL") String segmentCode
    ) {
        return ResponseEntity.ok(ApiResponseDto.ok(
            danaService.getSummary(level, levelId, snapshotDate, periodCode, segmentCode)
        ));
    }
}
```

### Service — aturan kalkulasi
- Tidak boleh inject Repository langsung di Controller
- Hitung achievement %, MoM, proporsi di service layer — bukan di query
- Gunakan BigDecimal untuk semua kalkulasi keuangan — bukan double/float
- UUID dari request dikirim sebagai hex string, convert dengan UUID.fromString()

### Repository — aturan query
- Gunakan native SQL Oracle untuk query agregasi kompleks (SUM, GROUP BY, JOIN hierarki)
- JPQL hanya untuk query sederhana (findById, findAll)
- Pattern agregasi hierarki lihat DATABASE.md

## CORS Config
```java
@Configuration
public class OracleConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

## Run Backend
```bash
cd branch-performance-mobile-be-v2
./mvnw spring-boot:run
```
