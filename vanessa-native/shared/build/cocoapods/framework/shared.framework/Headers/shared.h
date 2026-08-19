#import <Foundation/NSArray.h>
#import <Foundation/NSDictionary.h>
#import <Foundation/NSError.h>
#import <Foundation/NSObject.h>
#import <Foundation/NSSet.h>
#import <Foundation/NSString.h>
#import <Foundation/NSValue.h>

@class SharedTransaction, SharedStore, SharedFixedCost, SharedMoodEntry, SharedMood, SharedPiggyBank, SharedPlanningGoal, SharedUser, SharedBudgetSettings, SharedAuthResult, SharedCategory, SharedKotlinEnumCompanion, SharedKotlinEnum<E>, SharedKotlinArray<T>, SharedPaymentMethod, SharedTxType, SharedAuthUiState, SharedSharedApp, SharedHomeUiState, SharedKotlinTriple<__covariant A, __covariant B, __covariant C>, SharedKotlinPair<__covariant A, __covariant B>, SharedInsightsUiState, SharedPlanningUiState, SharedTransactionsUiState, UIViewController, SharedKotlinThrowable, SharedKotlinException, SharedKotlinRuntimeException, SharedKotlinIllegalStateException;

@protocol SharedKotlinx_coroutines_coreStateFlow, SharedKotlinComparable, SharedKotlinx_coroutines_coreFlowCollector, SharedKotlinx_coroutines_coreFlow, SharedKotlinx_coroutines_coreSharedFlow, SharedKotlinIterator;

NS_ASSUME_NONNULL_BEGIN
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunknown-warning-option"
#pragma clang diagnostic ignored "-Wincompatible-property-type"
#pragma clang diagnostic ignored "-Wnullability"

#pragma push_macro("_Nullable_result")
#if !__has_feature(nullability_nullable_result)
#undef _Nullable_result
#define _Nullable_result _Nullable
#endif

__attribute__((swift_name("KotlinBase")))
@interface SharedBase : NSObject
- (instancetype)init __attribute__((unavailable));
+ (instancetype)new __attribute__((unavailable));
+ (void)initialize __attribute__((objc_requires_super));
@end

@interface SharedBase (SharedBaseCopying) <NSCopying>
@end

__attribute__((swift_name("KotlinMutableSet")))
@interface SharedMutableSet<ObjectType> : NSMutableSet<ObjectType>
@end

__attribute__((swift_name("KotlinMutableDictionary")))
@interface SharedMutableDictionary<KeyType, ObjectType> : NSMutableDictionary<KeyType, ObjectType>
@end

@interface NSError (NSErrorSharedKotlinException)
@property (readonly) id _Nullable kotlinException;
@end

__attribute__((swift_name("KotlinNumber")))
@interface SharedNumber : NSNumber
- (instancetype)initWithChar:(char)value __attribute__((unavailable));
- (instancetype)initWithUnsignedChar:(unsigned char)value __attribute__((unavailable));
- (instancetype)initWithShort:(short)value __attribute__((unavailable));
- (instancetype)initWithUnsignedShort:(unsigned short)value __attribute__((unavailable));
- (instancetype)initWithInt:(int)value __attribute__((unavailable));
- (instancetype)initWithUnsignedInt:(unsigned int)value __attribute__((unavailable));
- (instancetype)initWithLong:(long)value __attribute__((unavailable));
- (instancetype)initWithUnsignedLong:(unsigned long)value __attribute__((unavailable));
- (instancetype)initWithLongLong:(long long)value __attribute__((unavailable));
- (instancetype)initWithUnsignedLongLong:(unsigned long long)value __attribute__((unavailable));
- (instancetype)initWithFloat:(float)value __attribute__((unavailable));
- (instancetype)initWithDouble:(double)value __attribute__((unavailable));
- (instancetype)initWithBool:(BOOL)value __attribute__((unavailable));
- (instancetype)initWithInteger:(NSInteger)value __attribute__((unavailable));
- (instancetype)initWithUnsignedInteger:(NSUInteger)value __attribute__((unavailable));
+ (instancetype)numberWithChar:(char)value __attribute__((unavailable));
+ (instancetype)numberWithUnsignedChar:(unsigned char)value __attribute__((unavailable));
+ (instancetype)numberWithShort:(short)value __attribute__((unavailable));
+ (instancetype)numberWithUnsignedShort:(unsigned short)value __attribute__((unavailable));
+ (instancetype)numberWithInt:(int)value __attribute__((unavailable));
+ (instancetype)numberWithUnsignedInt:(unsigned int)value __attribute__((unavailable));
+ (instancetype)numberWithLong:(long)value __attribute__((unavailable));
+ (instancetype)numberWithUnsignedLong:(unsigned long)value __attribute__((unavailable));
+ (instancetype)numberWithLongLong:(long long)value __attribute__((unavailable));
+ (instancetype)numberWithUnsignedLongLong:(unsigned long long)value __attribute__((unavailable));
+ (instancetype)numberWithFloat:(float)value __attribute__((unavailable));
+ (instancetype)numberWithDouble:(double)value __attribute__((unavailable));
+ (instancetype)numberWithBool:(BOOL)value __attribute__((unavailable));
+ (instancetype)numberWithInteger:(NSInteger)value __attribute__((unavailable));
+ (instancetype)numberWithUnsignedInteger:(NSUInteger)value __attribute__((unavailable));
@end

__attribute__((swift_name("KotlinByte")))
@interface SharedByte : SharedNumber
- (instancetype)initWithChar:(char)value;
+ (instancetype)numberWithChar:(char)value;
@end

__attribute__((swift_name("KotlinUByte")))
@interface SharedUByte : SharedNumber
- (instancetype)initWithUnsignedChar:(unsigned char)value;
+ (instancetype)numberWithUnsignedChar:(unsigned char)value;
@end

__attribute__((swift_name("KotlinShort")))
@interface SharedShort : SharedNumber
- (instancetype)initWithShort:(short)value;
+ (instancetype)numberWithShort:(short)value;
@end

__attribute__((swift_name("KotlinUShort")))
@interface SharedUShort : SharedNumber
- (instancetype)initWithUnsignedShort:(unsigned short)value;
+ (instancetype)numberWithUnsignedShort:(unsigned short)value;
@end

__attribute__((swift_name("KotlinInt")))
@interface SharedInt : SharedNumber
- (instancetype)initWithInt:(int)value;
+ (instancetype)numberWithInt:(int)value;
@end

__attribute__((swift_name("KotlinUInt")))
@interface SharedUInt : SharedNumber
- (instancetype)initWithUnsignedInt:(unsigned int)value;
+ (instancetype)numberWithUnsignedInt:(unsigned int)value;
@end

__attribute__((swift_name("KotlinLong")))
@interface SharedLong : SharedNumber
- (instancetype)initWithLongLong:(long long)value;
+ (instancetype)numberWithLongLong:(long long)value;
@end

__attribute__((swift_name("KotlinULong")))
@interface SharedULong : SharedNumber
- (instancetype)initWithUnsignedLongLong:(unsigned long long)value;
+ (instancetype)numberWithUnsignedLongLong:(unsigned long long)value;
@end

__attribute__((swift_name("KotlinFloat")))
@interface SharedFloat : SharedNumber
- (instancetype)initWithFloat:(float)value;
+ (instancetype)numberWithFloat:(float)value;
@end

__attribute__((swift_name("KotlinDouble")))
@interface SharedDouble : SharedNumber
- (instancetype)initWithDouble:(double)value;
+ (instancetype)numberWithDouble:(double)value;
@end

__attribute__((swift_name("KotlinBoolean")))
@interface SharedBoolean : SharedNumber
- (instancetype)initWithBool:(BOOL)value;
+ (instancetype)numberWithBool:(BOOL)value;
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("SharedApp")))
@interface SharedSharedApp : SharedBase
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (SharedTransaction * _Nullable)previewVoiceTranscriptText:(NSString *)text __attribute__((swift_name("previewVoiceTranscript(text:)")));
- (void)requestAudioCapture __attribute__((swift_name("requestAudioCapture()")));
- (void)requestPickFiles __attribute__((swift_name("requestPickFiles()")));
@property void (^ _Nullable onRequestAudioCapture)(void) __attribute__((swift_name("onRequestAudioCapture")));
@property void (^ _Nullable onRequestPickFiles)(void) __attribute__((swift_name("onRequestPickFiles")));
@property (readonly) SharedStore *store __attribute__((swift_name("store")));
@end

__attribute__((swift_name("Storage")))
@protocol SharedStorage
@required
- (NSString * _Nullable)getStringKey:(NSString *)key __attribute__((swift_name("getString(key:)")));
- (void)putStringKey:(NSString *)key value:(NSString * _Nullable)value __attribute__((swift_name("putString(key:value:)")));
- (void)removeKey:(NSString *)key __attribute__((swift_name("remove(key:)")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Store")))
@interface SharedStore : SharedBase
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (SharedFixedCost *)addFixedName:(NSString *)name amount:(double)amount dueDay:(int32_t)dueDay category:(NSString *)category __attribute__((swift_name("addFixed(name:amount:dueDay:category:)")));
- (SharedMoodEntry *)addMoodMood:(SharedMood *)mood __attribute__((swift_name("addMood(mood:)")));
- (SharedPiggyBank *)addPiggyName:(NSString *)name saved:(double)saved target:(double)target __attribute__((swift_name("addPiggy(name:saved:target:)")));
- (SharedPlanningGoal *)addPlanningTitle:(NSString *)title type:(NSString *)type target:(double)target months:(int32_t)months __attribute__((swift_name("addPlanning(title:type:target:months:)")));
- (SharedTransaction *)addTransactionT:(SharedTransaction *)t __attribute__((swift_name("addTransaction(t:)")));
- (void)clearTransactions __attribute__((swift_name("clearTransactions()")));
- (NSString *)currentMonthNow __attribute__((swift_name("currentMonthNow()")));
- (SharedUser * _Nullable)currentUser __attribute__((swift_name("currentUser()")));
- (void)deleteTransactionId:(NSString *)id __attribute__((swift_name("deleteTransaction(id:)")));
- (void)depositPiggyId:(NSString *)id delta:(double)delta __attribute__((swift_name("depositPiggy(id:delta:)")));
- (NSArray<SharedFixedCost *> *)fixedList __attribute__((swift_name("fixedList()")));
- (SharedBudgetSettings *)getBudget __attribute__((swift_name("getBudget()")));
- (void)hideExpensesNotificationId:(NSString *)id __attribute__((swift_name("hideExpensesNotification(id:)")));
- (void)hideHomeNotificationId:(NSString *)id __attribute__((swift_name("hideHomeNotification(id:)")));
- (BOOL)isExpenseHiddenId:(NSString *)id __attribute__((swift_name("isExpenseHidden(id:)")));
- (BOOL)isHomeHiddenId:(NSString *)id __attribute__((swift_name("isHomeHidden(id:)")));
- (SharedMoodEntry * _Nullable)latestMood __attribute__((swift_name("latestMood()")));
- (SharedAuthResult *)loginEmail:(NSString *)email password:(NSString *)password __attribute__((swift_name("login(email:password:)")));
- (void)logout __attribute__((swift_name("logout()")));
- (BOOL)markFixedPaidId:(NSString *)id __attribute__((swift_name("markFixedPaid(id:)")));
- (int64_t)nowMs __attribute__((swift_name("nowMs()")));
- (NSArray<SharedPiggyBank *> *)piggyList __attribute__((swift_name("piggyList()")));
- (NSArray<SharedPlanningGoal *> *)planningList __attribute__((swift_name("planningList()")));
- (void)removeCategoryLimitCat:(SharedCategory *)cat __attribute__((swift_name("removeCategoryLimit(cat:)")));
- (void)removeFixedId:(NSString *)id __attribute__((swift_name("removeFixed(id:)")));
- (void)removePiggyId:(NSString *)id __attribute__((swift_name("removePiggy(id:)")));
- (void)removePlanningId:(NSString *)id __attribute__((swift_name("removePlanning(id:)")));
- (BOOL)sameMonthNowTs:(int64_t)ts __attribute__((swift_name("sameMonthNow(ts:)")));
- (void)setCategoryLimitCat:(SharedCategory *)cat limit:(double)limit __attribute__((swift_name("setCategoryLimit(cat:limit:)")));
- (void)setMonthlyLimitLimit:(SharedDouble * _Nullable)limit __attribute__((swift_name("setMonthlyLimit(limit:)")));
- (SharedAuthResult *)signupName:(NSString *)name email:(NSString *)email password:(NSString *)password __attribute__((swift_name("signup(name:email:password:)")));
- (NSArray<SharedTransaction *> *)transactions __attribute__((swift_name("transactions()")));
@property (readonly) id<SharedKotlinx_coroutines_coreStateFlow> sessionUserId __attribute__((swift_name("sessionUserId")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("AuthResult")))
@interface SharedAuthResult : SharedBase
- (instancetype)initWithSuccess:(BOOL)success errorMessage:(NSString * _Nullable)errorMessage user:(SharedUser * _Nullable)user __attribute__((swift_name("init(success:errorMessage:user:)"))) __attribute__((objc_designated_initializer));
- (SharedAuthResult *)doCopySuccess:(BOOL)success errorMessage:(NSString * _Nullable)errorMessage user:(SharedUser * _Nullable)user __attribute__((swift_name("doCopy(success:errorMessage:user:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSString * _Nullable errorMessage __attribute__((swift_name("errorMessage")));
@property (readonly) BOOL success __attribute__((swift_name("success")));
@property (readonly) SharedUser * _Nullable user __attribute__((swift_name("user")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("BudgetSettings")))
@interface SharedBudgetSettings : SharedBase
- (instancetype)initWithMonthlyLimit:(SharedDouble * _Nullable)monthlyLimit categoryLimits:(NSDictionary<SharedCategory *, SharedDouble *> *)categoryLimits updatedAtMs:(int64_t)updatedAtMs __attribute__((swift_name("init(monthlyLimit:categoryLimits:updatedAtMs:)"))) __attribute__((objc_designated_initializer));
- (SharedBudgetSettings *)doCopyMonthlyLimit:(SharedDouble * _Nullable)monthlyLimit categoryLimits:(NSDictionary<SharedCategory *, SharedDouble *> *)categoryLimits updatedAtMs:(int64_t)updatedAtMs __attribute__((swift_name("doCopy(monthlyLimit:categoryLimits:updatedAtMs:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSDictionary<SharedCategory *, SharedDouble *> *categoryLimits __attribute__((swift_name("categoryLimits")));
@property (readonly) SharedDouble * _Nullable monthlyLimit __attribute__((swift_name("monthlyLimit")));
@property (readonly) int64_t updatedAtMs __attribute__((swift_name("updatedAtMs")));
@end

__attribute__((swift_name("KotlinComparable")))
@protocol SharedKotlinComparable
@required
- (int32_t)compareToOther:(id _Nullable)other __attribute__((swift_name("compareTo(other:)")));
@end

__attribute__((swift_name("KotlinEnum")))
@interface SharedKotlinEnum<E> : SharedBase <SharedKotlinComparable>
- (instancetype)initWithName:(NSString *)name ordinal:(int32_t)ordinal __attribute__((swift_name("init(name:ordinal:)"))) __attribute__((objc_designated_initializer));
@property (class, readonly, getter=companion) SharedKotlinEnumCompanion *companion __attribute__((swift_name("companion")));
- (int32_t)compareToOther:(E)other __attribute__((swift_name("compareTo(other:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSString *name __attribute__((swift_name("name")));
@property (readonly) int32_t ordinal __attribute__((swift_name("ordinal")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Category")))
@interface SharedCategory : SharedKotlinEnum<SharedCategory *>
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
- (instancetype)initWithName:(NSString *)name ordinal:(int32_t)ordinal __attribute__((swift_name("init(name:ordinal:)"))) __attribute__((objc_designated_initializer)) __attribute__((unavailable));
@property (class, readonly) SharedCategory *alimentacao __attribute__((swift_name("alimentacao")));
@property (class, readonly) SharedCategory *transporte __attribute__((swift_name("transporte")));
@property (class, readonly) SharedCategory *combustivel __attribute__((swift_name("combustivel")));
@property (class, readonly) SharedCategory *lazer __attribute__((swift_name("lazer")));
@property (class, readonly) SharedCategory *saude __attribute__((swift_name("saude")));
@property (class, readonly) SharedCategory *educacao __attribute__((swift_name("educacao")));
@property (class, readonly) SharedCategory *moradia __attribute__((swift_name("moradia")));
@property (class, readonly) SharedCategory *vestuario __attribute__((swift_name("vestuario")));
@property (class, readonly) SharedCategory *outros __attribute__((swift_name("outros")));
+ (SharedKotlinArray<SharedCategory *> *)values __attribute__((swift_name("values()")));
@property (class, readonly) NSArray<SharedCategory *> *entries __attribute__((swift_name("entries")));
@property (readonly) NSString *label __attribute__((swift_name("label")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("FixedCost")))
@interface SharedFixedCost : SharedBase
- (instancetype)initWithId:(NSString *)id name:(NSString *)name amount:(double)amount dueDay:(int32_t)dueDay category:(NSString *)category createdAtMs:(int64_t)createdAtMs paidMonths:(NSDictionary<NSString *, SharedBoolean *> *)paidMonths __attribute__((swift_name("init(id:name:amount:dueDay:category:createdAtMs:paidMonths:)"))) __attribute__((objc_designated_initializer));
- (SharedFixedCost *)doCopyId:(NSString *)id name:(NSString *)name amount:(double)amount dueDay:(int32_t)dueDay category:(NSString *)category createdAtMs:(int64_t)createdAtMs paidMonths:(NSDictionary<NSString *, SharedBoolean *> *)paidMonths __attribute__((swift_name("doCopy(id:name:amount:dueDay:category:createdAtMs:paidMonths:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) double amount __attribute__((swift_name("amount")));
@property (readonly) NSString *category __attribute__((swift_name("category")));
@property (readonly) int64_t createdAtMs __attribute__((swift_name("createdAtMs")));
@property (readonly) int32_t dueDay __attribute__((swift_name("dueDay")));
@property (readonly) NSString *id __attribute__((swift_name("id")));
@property (readonly) NSString *name __attribute__((swift_name("name")));
@property (readonly) NSDictionary<NSString *, SharedBoolean *> *paidMonths __attribute__((swift_name("paidMonths")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Mood")))
@interface SharedMood : SharedKotlinEnum<SharedMood *>
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
- (instancetype)initWithName:(NSString *)name ordinal:(int32_t)ordinal __attribute__((swift_name("init(name:ordinal:)"))) __attribute__((objc_designated_initializer)) __attribute__((unavailable));
@property (class, readonly) SharedMood *ansiedade __attribute__((swift_name("ansiedade")));
@property (class, readonly) SharedMood *tedio __attribute__((swift_name("tedio")));
@property (class, readonly) SharedMood *euforia __attribute__((swift_name("euforia")));
@property (class, readonly) SharedMood *tristeza __attribute__((swift_name("tristeza")));
@property (class, readonly) SharedMood *calmaria __attribute__((swift_name("calmaria")));
+ (SharedKotlinArray<SharedMood *> *)values __attribute__((swift_name("values()")));
@property (class, readonly) NSArray<SharedMood *> *entries __attribute__((swift_name("entries")));
@property (readonly) BOOL isImpulsive __attribute__((swift_name("isImpulsive")));
@property (readonly) NSString *label __attribute__((swift_name("label")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("MoodEntry")))
@interface SharedMoodEntry : SharedBase
- (instancetype)initWithId:(NSString *)id mood:(SharedMood *)mood timestampMs:(int64_t)timestampMs __attribute__((swift_name("init(id:mood:timestampMs:)"))) __attribute__((objc_designated_initializer));
- (SharedMoodEntry *)doCopyId:(NSString *)id mood:(SharedMood *)mood timestampMs:(int64_t)timestampMs __attribute__((swift_name("doCopy(id:mood:timestampMs:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSString *id __attribute__((swift_name("id")));
@property (readonly) SharedMood *mood __attribute__((swift_name("mood")));
@property (readonly) int64_t timestampMs __attribute__((swift_name("timestampMs")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("PaymentMethod")))
@interface SharedPaymentMethod : SharedKotlinEnum<SharedPaymentMethod *>
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
- (instancetype)initWithName:(NSString *)name ordinal:(int32_t)ordinal __attribute__((swift_name("init(name:ordinal:)"))) __attribute__((objc_designated_initializer)) __attribute__((unavailable));
@property (class, readonly) SharedPaymentMethod *contaCorrente __attribute__((swift_name("contaCorrente")));
@property (class, readonly) SharedPaymentMethod *credito __attribute__((swift_name("credito")));
+ (SharedKotlinArray<SharedPaymentMethod *> *)values __attribute__((swift_name("values()")));
@property (class, readonly) NSArray<SharedPaymentMethod *> *entries __attribute__((swift_name("entries")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("PiggyBank")))
@interface SharedPiggyBank : SharedBase
- (instancetype)initWithId:(NSString *)id name:(NSString *)name savedAmount:(double)savedAmount targetAmount:(double)targetAmount createdAtMs:(int64_t)createdAtMs __attribute__((swift_name("init(id:name:savedAmount:targetAmount:createdAtMs:)"))) __attribute__((objc_designated_initializer));
- (SharedPiggyBank *)doCopyId:(NSString *)id name:(NSString *)name savedAmount:(double)savedAmount targetAmount:(double)targetAmount createdAtMs:(int64_t)createdAtMs __attribute__((swift_name("doCopy(id:name:savedAmount:targetAmount:createdAtMs:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) int64_t createdAtMs __attribute__((swift_name("createdAtMs")));
@property (readonly) NSString *id __attribute__((swift_name("id")));
@property (readonly) NSString *name __attribute__((swift_name("name")));
@property (readonly) double savedAmount __attribute__((swift_name("savedAmount")));
@property (readonly) double targetAmount __attribute__((swift_name("targetAmount")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("PlanningGoal")))
@interface SharedPlanningGoal : SharedBase
- (instancetype)initWithId:(NSString *)id title:(NSString *)title type:(NSString *)type targetAmount:(double)targetAmount targetMonths:(int32_t)targetMonths createdAtMs:(int64_t)createdAtMs __attribute__((swift_name("init(id:title:type:targetAmount:targetMonths:createdAtMs:)"))) __attribute__((objc_designated_initializer));
- (SharedPlanningGoal *)doCopyId:(NSString *)id title:(NSString *)title type:(NSString *)type targetAmount:(double)targetAmount targetMonths:(int32_t)targetMonths createdAtMs:(int64_t)createdAtMs __attribute__((swift_name("doCopy(id:title:type:targetAmount:targetMonths:createdAtMs:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) int64_t createdAtMs __attribute__((swift_name("createdAtMs")));
@property (readonly) NSString *id __attribute__((swift_name("id")));
@property (readonly) double targetAmount __attribute__((swift_name("targetAmount")));
@property (readonly) int32_t targetMonths __attribute__((swift_name("targetMonths")));
@property (readonly) NSString *title __attribute__((swift_name("title")));
@property (readonly) NSString *type __attribute__((swift_name("type")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("Transaction")))
@interface SharedTransaction : SharedBase
- (instancetype)initWithId:(NSString *)id value:(double)value category:(SharedCategory *)category type:(SharedTxType *)type paymentMethod:(SharedPaymentMethod *)paymentMethod description:(NSString *)description moodId:(NSString * _Nullable)moodId mood:(SharedMood * _Nullable)mood timestampMs:(int64_t)timestampMs sleeping:(BOOL)sleeping sleepUntilMs:(SharedLong * _Nullable)sleepUntilMs excludeFromSavingsAdvice:(BOOL)excludeFromSavingsAdvice __attribute__((swift_name("init(id:value:category:type:paymentMethod:description:moodId:mood:timestampMs:sleeping:sleepUntilMs:excludeFromSavingsAdvice:)"))) __attribute__((objc_designated_initializer));
- (SharedTransaction *)doCopyId:(NSString *)id value:(double)value category:(SharedCategory *)category type:(SharedTxType *)type paymentMethod:(SharedPaymentMethod *)paymentMethod description:(NSString *)description moodId:(NSString * _Nullable)moodId mood:(SharedMood * _Nullable)mood timestampMs:(int64_t)timestampMs sleeping:(BOOL)sleeping sleepUntilMs:(SharedLong * _Nullable)sleepUntilMs excludeFromSavingsAdvice:(BOOL)excludeFromSavingsAdvice __attribute__((swift_name("doCopy(id:value:category:type:paymentMethod:description:moodId:mood:timestampMs:sleeping:sleepUntilMs:excludeFromSavingsAdvice:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) SharedCategory *category __attribute__((swift_name("category")));
@property (readonly) NSString *description_ __attribute__((swift_name("description_")));
@property (readonly) BOOL excludeFromSavingsAdvice __attribute__((swift_name("excludeFromSavingsAdvice")));
@property (readonly) NSString *id __attribute__((swift_name("id")));
@property (readonly) SharedMood * _Nullable mood __attribute__((swift_name("mood")));
@property (readonly) NSString * _Nullable moodId __attribute__((swift_name("moodId")));
@property (readonly) SharedPaymentMethod *paymentMethod __attribute__((swift_name("paymentMethod")));
@property (readonly) SharedLong * _Nullable sleepUntilMs __attribute__((swift_name("sleepUntilMs")));
@property (readonly) BOOL sleeping __attribute__((swift_name("sleeping")));
@property (readonly) int64_t timestampMs __attribute__((swift_name("timestampMs")));
@property (readonly) SharedTxType *type __attribute__((swift_name("type")));
@property (readonly) double value __attribute__((swift_name("value")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("TxType")))
@interface SharedTxType : SharedKotlinEnum<SharedTxType *>
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
- (instancetype)initWithName:(NSString *)name ordinal:(int32_t)ordinal __attribute__((swift_name("init(name:ordinal:)"))) __attribute__((objc_designated_initializer)) __attribute__((unavailable));
@property (class, readonly) SharedTxType *entrada __attribute__((swift_name("entrada")));
@property (class, readonly) SharedTxType *saida __attribute__((swift_name("saida")));
+ (SharedKotlinArray<SharedTxType *> *)values __attribute__((swift_name("values()")));
@property (class, readonly) NSArray<SharedTxType *> *entries __attribute__((swift_name("entries")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("User")))
@interface SharedUser : SharedBase
- (instancetype)initWithId:(NSString *)id name:(NSString *)name email:(NSString *)email passwordHash:(NSString *)passwordHash createdAtMs:(int64_t)createdAtMs __attribute__((swift_name("init(id:name:email:passwordHash:createdAtMs:)"))) __attribute__((objc_designated_initializer));
- (SharedUser *)doCopyId:(NSString *)id name:(NSString *)name email:(NSString *)email passwordHash:(NSString *)passwordHash createdAtMs:(int64_t)createdAtMs __attribute__((swift_name("doCopy(id:name:email:passwordHash:createdAtMs:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) int64_t createdAtMs __attribute__((swift_name("createdAtMs")));
@property (readonly) NSString *email __attribute__((swift_name("email")));
@property (readonly) NSString *id __attribute__((swift_name("id")));
@property (readonly) NSString *name __attribute__((swift_name("name")));
@property (readonly) NSString *passwordHash __attribute__((swift_name("passwordHash")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("AuthUiState")))
@interface SharedAuthUiState : SharedBase
- (instancetype)initWithLoading:(BOOL)loading errorMessage:(NSString * _Nullable)errorMessage authed:(BOOL)authed __attribute__((swift_name("init(loading:errorMessage:authed:)"))) __attribute__((objc_designated_initializer));
- (SharedAuthUiState *)doCopyLoading:(BOOL)loading errorMessage:(NSString * _Nullable)errorMessage authed:(BOOL)authed __attribute__((swift_name("doCopy(loading:errorMessage:authed:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) BOOL authed __attribute__((swift_name("authed")));
@property (readonly) NSString * _Nullable errorMessage __attribute__((swift_name("errorMessage")));
@property (readonly) BOOL loading __attribute__((swift_name("loading")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("AuthViewModel")))
@interface SharedAuthViewModel : SharedBase
- (instancetype)initWithApp:(SharedSharedApp *)app __attribute__((swift_name("init(app:)"))) __attribute__((objc_designated_initializer));
- (void)loginEmail:(NSString *)email password:(NSString *)password __attribute__((swift_name("login(email:password:)")));
- (void)logout __attribute__((swift_name("logout()")));
- (void)signupName:(NSString *)name email:(NSString *)email password:(NSString *)password __attribute__((swift_name("signup(name:email:password:)")));
@property (readonly) id<SharedKotlinx_coroutines_coreStateFlow> state __attribute__((swift_name("state")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("HomeUiState")))
@interface SharedHomeUiState : SharedBase
- (instancetype)initWithUserName:(NSString *)userName mood:(SharedMood * _Nullable)mood monthlyIncome:(double)monthlyIncome monthlyExpense:(double)monthlyExpense recent:(NSArray<SharedTransaction *> *)recent sleepingWakeUp:(NSArray<SharedTransaction *> *)sleepingWakeUp happinessNote:(NSString * _Nullable)happinessNote showMoodCheckin:(BOOL)showMoodCheckin __attribute__((swift_name("init(userName:mood:monthlyIncome:monthlyExpense:recent:sleepingWakeUp:happinessNote:showMoodCheckin:)"))) __attribute__((objc_designated_initializer));
- (SharedHomeUiState *)doCopyUserName:(NSString *)userName mood:(SharedMood * _Nullable)mood monthlyIncome:(double)monthlyIncome monthlyExpense:(double)monthlyExpense recent:(NSArray<SharedTransaction *> *)recent sleepingWakeUp:(NSArray<SharedTransaction *> *)sleepingWakeUp happinessNote:(NSString * _Nullable)happinessNote showMoodCheckin:(BOOL)showMoodCheckin __attribute__((swift_name("doCopy(userName:mood:monthlyIncome:monthlyExpense:recent:sleepingWakeUp:happinessNote:showMoodCheckin:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSString * _Nullable happinessNote __attribute__((swift_name("happinessNote")));
@property (readonly) double monthlyExpense __attribute__((swift_name("monthlyExpense")));
@property (readonly) double monthlyIncome __attribute__((swift_name("monthlyIncome")));
@property (readonly) SharedMood * _Nullable mood __attribute__((swift_name("mood")));
@property (readonly) NSArray<SharedTransaction *> *recent __attribute__((swift_name("recent")));
@property (readonly) BOOL showMoodCheckin __attribute__((swift_name("showMoodCheckin")));
@property (readonly) NSArray<SharedTransaction *> *sleepingWakeUp __attribute__((swift_name("sleepingWakeUp")));
@property (readonly) NSString *userName __attribute__((swift_name("userName")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("HomeViewModel")))
@interface SharedHomeViewModel : SharedBase
- (instancetype)initWithApp:(SharedSharedApp *)app __attribute__((swift_name("init(app:)"))) __attribute__((objc_designated_initializer));
- (void)dismissMoodCheckin __attribute__((swift_name("dismissMoodCheckin()")));
- (BOOL)pickMoodM:(SharedMood *)m __attribute__((swift_name("pickMood(m:)")));
- (void)refresh __attribute__((swift_name("refresh()")));
@property (readonly) id<SharedKotlinx_coroutines_coreStateFlow> state __attribute__((swift_name("state")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("InsightsUiState")))
@interface SharedInsightsUiState : SharedBase
- (instancetype)initWithByMood:(NSArray<SharedKotlinTriple<SharedMood *, SharedDouble *, SharedInt *> *> *)byMood byCategory:(NSArray<SharedKotlinPair<SharedCategory *, SharedDouble *> *> *)byCategory goals:(NSArray<SharedKotlinTriple<SharedCategory *, NSString *, SharedInt *> *> *)goals __attribute__((swift_name("init(byMood:byCategory:goals:)"))) __attribute__((objc_designated_initializer));
- (SharedInsightsUiState *)doCopyByMood:(NSArray<SharedKotlinTriple<SharedMood *, SharedDouble *, SharedInt *> *> *)byMood byCategory:(NSArray<SharedKotlinPair<SharedCategory *, SharedDouble *> *> *)byCategory goals:(NSArray<SharedKotlinTriple<SharedCategory *, NSString *, SharedInt *> *> *)goals __attribute__((swift_name("doCopy(byMood:byCategory:goals:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSArray<SharedKotlinPair<SharedCategory *, SharedDouble *> *> *byCategory __attribute__((swift_name("byCategory")));
@property (readonly) NSArray<SharedKotlinTriple<SharedMood *, SharedDouble *, SharedInt *> *> *byMood __attribute__((swift_name("byMood")));
@property (readonly) NSArray<SharedKotlinTriple<SharedCategory *, NSString *, SharedInt *> *> *goals __attribute__((swift_name("goals")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("InsightsViewModel")))
@interface SharedInsightsViewModel : SharedBase
- (instancetype)initWithApp:(SharedSharedApp *)app __attribute__((swift_name("init(app:)"))) __attribute__((objc_designated_initializer));
- (void)refresh __attribute__((swift_name("refresh()")));
@property (readonly) id<SharedKotlinx_coroutines_coreStateFlow> state __attribute__((swift_name("state")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("PlanningUiState")))
@interface SharedPlanningUiState : SharedBase
- (instancetype)initWithPiggy:(NSArray<SharedPiggyBank *> *)piggy goals:(NSArray<SharedPlanningGoal *> *)goals fixed:(NSArray<SharedFixedCost *> *)fixed monthlyIncome:(double)monthlyIncome dueSoon:(NSArray<SharedKotlinPair<SharedFixedCost *, SharedInt *> *> *)dueSoon dueToday:(NSArray<SharedFixedCost *> *)dueToday overdue:(NSArray<SharedKotlinPair<SharedFixedCost *, SharedInt *> *> *)overdue __attribute__((swift_name("init(piggy:goals:fixed:monthlyIncome:dueSoon:dueToday:overdue:)"))) __attribute__((objc_designated_initializer));
- (SharedPlanningUiState *)doCopyPiggy:(NSArray<SharedPiggyBank *> *)piggy goals:(NSArray<SharedPlanningGoal *> *)goals fixed:(NSArray<SharedFixedCost *> *)fixed monthlyIncome:(double)monthlyIncome dueSoon:(NSArray<SharedKotlinPair<SharedFixedCost *, SharedInt *> *> *)dueSoon dueToday:(NSArray<SharedFixedCost *> *)dueToday overdue:(NSArray<SharedKotlinPair<SharedFixedCost *, SharedInt *> *> *)overdue __attribute__((swift_name("doCopy(piggy:goals:fixed:monthlyIncome:dueSoon:dueToday:overdue:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSArray<SharedKotlinPair<SharedFixedCost *, SharedInt *> *> *dueSoon __attribute__((swift_name("dueSoon")));
@property (readonly) NSArray<SharedFixedCost *> *dueToday __attribute__((swift_name("dueToday")));
@property (readonly) NSArray<SharedFixedCost *> *fixed __attribute__((swift_name("fixed")));
@property (readonly) NSArray<SharedPlanningGoal *> *goals __attribute__((swift_name("goals")));
@property (readonly) double monthlyIncome __attribute__((swift_name("monthlyIncome")));
@property (readonly) NSArray<SharedKotlinPair<SharedFixedCost *, SharedInt *> *> *overdue __attribute__((swift_name("overdue")));
@property (readonly) NSArray<SharedPiggyBank *> *piggy __attribute__((swift_name("piggy")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("PlanningViewModel")))
@interface SharedPlanningViewModel : SharedBase
- (instancetype)initWithApp:(SharedSharedApp *)app __attribute__((swift_name("init(app:)"))) __attribute__((objc_designated_initializer));
- (void)addFixedName:(NSString *)name amount:(double)amount dueDay:(int32_t)dueDay category:(NSString *)category __attribute__((swift_name("addFixed(name:amount:dueDay:category:)")));
- (void)addGoalTitle:(NSString *)title type:(NSString *)type target:(double)target months:(int32_t)months __attribute__((swift_name("addGoal(title:type:target:months:)")));
- (void)addPiggyName:(NSString *)name saved:(double)saved target:(double)target __attribute__((swift_name("addPiggy(name:saved:target:)")));
- (void)depositPiggyId:(NSString *)id delta:(double)delta __attribute__((swift_name("depositPiggy(id:delta:)")));
- (void)markFixedPaidId:(NSString *)id __attribute__((swift_name("markFixedPaid(id:)")));
- (void)refresh __attribute__((swift_name("refresh()")));
- (void)removeFixedId:(NSString *)id __attribute__((swift_name("removeFixed(id:)")));
- (void)removeGoalId:(NSString *)id __attribute__((swift_name("removeGoal(id:)")));
- (void)removePiggyId:(NSString *)id __attribute__((swift_name("removePiggy(id:)")));
@property (readonly) id<SharedKotlinx_coroutines_coreStateFlow> state __attribute__((swift_name("state")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("TransactionsUiState")))
@interface SharedTransactionsUiState : SharedBase
- (instancetype)initWithList:(NSArray<SharedTransaction *> *)list hiddenExpenses:(NSSet<NSString *> *)hiddenExpenses latestMood:(SharedMood * _Nullable)latestMood byMood:(NSArray<SharedKotlinTriple<SharedMood *, SharedDouble *, SharedInt *> *> *)byMood __attribute__((swift_name("init(list:hiddenExpenses:latestMood:byMood:)"))) __attribute__((objc_designated_initializer));
- (SharedTransactionsUiState *)doCopyList:(NSArray<SharedTransaction *> *)list hiddenExpenses:(NSSet<NSString *> *)hiddenExpenses latestMood:(SharedMood * _Nullable)latestMood byMood:(NSArray<SharedKotlinTriple<SharedMood *, SharedDouble *, SharedInt *> *> *)byMood __attribute__((swift_name("doCopy(list:hiddenExpenses:latestMood:byMood:)")));
- (BOOL)isEqual:(id _Nullable)other __attribute__((swift_name("isEqual(_:)")));
- (NSUInteger)hash __attribute__((swift_name("hash()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) NSArray<SharedKotlinTriple<SharedMood *, SharedDouble *, SharedInt *> *> *byMood __attribute__((swift_name("byMood")));
@property (readonly) NSSet<NSString *> *hiddenExpenses __attribute__((swift_name("hiddenExpenses")));
@property (readonly) SharedMood * _Nullable latestMood __attribute__((swift_name("latestMood")));
@property (readonly) NSArray<SharedTransaction *> *list __attribute__((swift_name("list")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("TransactionsViewModel")))
@interface SharedTransactionsViewModel : SharedBase
- (instancetype)initWithApp:(SharedSharedApp *)app __attribute__((swift_name("init(app:)"))) __attribute__((objc_designated_initializer));
- (void)addItems:(NSArray<SharedKotlinTriple<SharedDouble *, NSString *, NSString *> *> *)items __attribute__((swift_name("add(items:)")));
- (void)addValue:(double)value category:(SharedCategory *)category type:(SharedTxType *)type paymentMethod:(SharedPaymentMethod *)paymentMethod description:(NSString *)description exclude:(BOOL)exclude __attribute__((swift_name("add(value:category:type:paymentMethod:description:exclude:)")));
- (void)clearAll __attribute__((swift_name("clearAll()")));
- (void)deleteId:(NSString *)id __attribute__((swift_name("delete(id:)")));
- (void)hideExpenseId:(NSString *)id __attribute__((swift_name("hideExpense(id:)")));
- (void)refresh __attribute__((swift_name("refresh()")));
@property (readonly) id<SharedKotlinx_coroutines_coreStateFlow> state __attribute__((swift_name("state")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("IOSAppEntryKt")))
@interface SharedIOSAppEntryKt : SharedBase
+ (UIViewController *)MainViewControllerApp:(id _Nullable)app __attribute__((swift_name("MainViewController(app:)")));
@end

__attribute__((swift_name("Kotlinx_coroutines_coreFlow")))
@protocol SharedKotlinx_coroutines_coreFlow
@required

/**
 * @note This method converts instances of CancellationException to errors.
 * Other uncaught Kotlin exceptions are fatal.
*/
- (void)collectCollector:(id<SharedKotlinx_coroutines_coreFlowCollector>)collector completionHandler:(void (^)(NSError * _Nullable))completionHandler __attribute__((swift_name("collect(collector:completionHandler:)")));
@end

__attribute__((swift_name("Kotlinx_coroutines_coreSharedFlow")))
@protocol SharedKotlinx_coroutines_coreSharedFlow <SharedKotlinx_coroutines_coreFlow>
@required
@property (readonly) NSArray<id> *replayCache __attribute__((swift_name("replayCache")));
@end

__attribute__((swift_name("Kotlinx_coroutines_coreStateFlow")))
@protocol SharedKotlinx_coroutines_coreStateFlow <SharedKotlinx_coroutines_coreSharedFlow>
@required
@property (readonly) id _Nullable value __attribute__((swift_name("value")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("KotlinEnumCompanion")))
@interface SharedKotlinEnumCompanion : SharedBase
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
+ (instancetype)companion __attribute__((swift_name("init()")));
@property (class, readonly, getter=shared) SharedKotlinEnumCompanion *shared __attribute__((swift_name("shared")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("KotlinArray")))
@interface SharedKotlinArray<T> : SharedBase
+ (instancetype)arrayWithSize:(int32_t)size init:(T _Nullable (^)(SharedInt *))init __attribute__((swift_name("init(size:init:)")));
+ (instancetype)alloc __attribute__((unavailable));
+ (instancetype)allocWithZone:(struct _NSZone *)zone __attribute__((unavailable));
- (T _Nullable)getIndex:(int32_t)index __attribute__((swift_name("get(index:)")));
- (id<SharedKotlinIterator>)iterator __attribute__((swift_name("iterator()")));
- (void)setIndex:(int32_t)index value:(T _Nullable)value __attribute__((swift_name("set(index:value:)")));
@property (readonly) int32_t size __attribute__((swift_name("size")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("KotlinTriple")))
@interface SharedKotlinTriple<__covariant A, __covariant B, __covariant C> : SharedBase
- (instancetype)initWithFirst:(A _Nullable)first second:(B _Nullable)second third:(C _Nullable)third __attribute__((swift_name("init(first:second:third:)"))) __attribute__((objc_designated_initializer));
- (SharedKotlinTriple<A, B, C> *)doCopyFirst:(A _Nullable)first second:(B _Nullable)second third:(C _Nullable)third __attribute__((swift_name("doCopy(first:second:third:)")));
- (BOOL)equalsOther:(id _Nullable)other __attribute__((swift_name("equals(other:)")));
- (int32_t)hashCode __attribute__((swift_name("hashCode()")));
- (NSString *)toString __attribute__((swift_name("toString()")));
@property (readonly) A _Nullable first __attribute__((swift_name("first")));
@property (readonly) B _Nullable second __attribute__((swift_name("second")));
@property (readonly) C _Nullable third __attribute__((swift_name("third")));
@end

__attribute__((objc_subclassing_restricted))
__attribute__((swift_name("KotlinPair")))
@interface SharedKotlinPair<__covariant A, __covariant B> : SharedBase
- (instancetype)initWithFirst:(A _Nullable)first second:(B _Nullable)second __attribute__((swift_name("init(first:second:)"))) __attribute__((objc_designated_initializer));
- (SharedKotlinPair<A, B> *)doCopyFirst:(A _Nullable)first second:(B _Nullable)second __attribute__((swift_name("doCopy(first:second:)")));
- (BOOL)equalsOther:(id _Nullable)other __attribute__((swift_name("equals(other:)")));
- (int32_t)hashCode __attribute__((swift_name("hashCode()")));
- (NSString *)toString __attribute__((swift_name("toString()")));
@property (readonly) A _Nullable first __attribute__((swift_name("first")));
@property (readonly) B _Nullable second __attribute__((swift_name("second")));
@end

__attribute__((swift_name("KotlinThrowable")))
@interface SharedKotlinThrowable : SharedBase
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (instancetype)initWithMessage:(NSString * _Nullable)message __attribute__((swift_name("init(message:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithCause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(cause:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithMessage:(NSString * _Nullable)message cause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(message:cause:)"))) __attribute__((objc_designated_initializer));

/**
 * @note annotations
 *   kotlin.experimental.ExperimentalNativeApi
*/
- (SharedKotlinArray<NSString *> *)getStackTrace __attribute__((swift_name("getStackTrace()")));
- (void)printStackTrace __attribute__((swift_name("printStackTrace()")));
- (NSString *)description __attribute__((swift_name("description()")));
@property (readonly) SharedKotlinThrowable * _Nullable cause __attribute__((swift_name("cause")));
@property (readonly) NSString * _Nullable message __attribute__((swift_name("message")));
- (NSError *)asError __attribute__((swift_name("asError()")));
@end

__attribute__((swift_name("KotlinException")))
@interface SharedKotlinException : SharedKotlinThrowable
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (instancetype)initWithMessage:(NSString * _Nullable)message __attribute__((swift_name("init(message:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithCause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(cause:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithMessage:(NSString * _Nullable)message cause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(message:cause:)"))) __attribute__((objc_designated_initializer));
@end

__attribute__((swift_name("KotlinRuntimeException")))
@interface SharedKotlinRuntimeException : SharedKotlinException
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (instancetype)initWithMessage:(NSString * _Nullable)message __attribute__((swift_name("init(message:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithCause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(cause:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithMessage:(NSString * _Nullable)message cause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(message:cause:)"))) __attribute__((objc_designated_initializer));
@end

__attribute__((swift_name("KotlinIllegalStateException")))
@interface SharedKotlinIllegalStateException : SharedKotlinRuntimeException
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (instancetype)initWithMessage:(NSString * _Nullable)message __attribute__((swift_name("init(message:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithCause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(cause:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithMessage:(NSString * _Nullable)message cause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(message:cause:)"))) __attribute__((objc_designated_initializer));
@end


/**
 * @note annotations
 *   kotlin.SinceKotlin(version="1.4")
*/
__attribute__((swift_name("KotlinCancellationException")))
@interface SharedKotlinCancellationException : SharedKotlinIllegalStateException
- (instancetype)init __attribute__((swift_name("init()"))) __attribute__((objc_designated_initializer));
+ (instancetype)new __attribute__((availability(swift, unavailable, message="use object initializers instead")));
- (instancetype)initWithMessage:(NSString * _Nullable)message __attribute__((swift_name("init(message:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithCause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(cause:)"))) __attribute__((objc_designated_initializer));
- (instancetype)initWithMessage:(NSString * _Nullable)message cause:(SharedKotlinThrowable * _Nullable)cause __attribute__((swift_name("init(message:cause:)"))) __attribute__((objc_designated_initializer));
@end

__attribute__((swift_name("Kotlinx_coroutines_coreFlowCollector")))
@protocol SharedKotlinx_coroutines_coreFlowCollector
@required

/**
 * @note This method converts instances of CancellationException to errors.
 * Other uncaught Kotlin exceptions are fatal.
*/
- (void)emitValue:(id _Nullable)value completionHandler:(void (^)(NSError * _Nullable))completionHandler __attribute__((swift_name("emit(value:completionHandler:)")));
@end

__attribute__((swift_name("KotlinIterator")))
@protocol SharedKotlinIterator
@required
- (BOOL)hasNext __attribute__((swift_name("hasNext()")));
- (id _Nullable)next __attribute__((swift_name("next()")));
@end

#pragma pop_macro("_Nullable_result")
#pragma clang diagnostic pop
NS_ASSUME_NONNULL_END
